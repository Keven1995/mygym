require 'json'
require 'net/http'
require 'openssl'

class FirebaseTokenVerifier
  CERTIFICATES_URL = URI('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com')
  ISSUER_PREFIX = 'https://securetoken.google.com/'

  class Error < StandardError; end
  class ConfigurationError < Error; end
  class MissingTokenError < Error; end
  class InvalidTokenError < Error; end

  class << self
    def verify(token)
      new(token).verify
    end

    def reset_cache!
      @certificates = nil
      @certificates_expires_at = nil
    end

    private

    def certificates
      return @certificates if @certificates && @certificates_expires_at && Time.current < @certificates_expires_at

      response = Net::HTTP.get_response(CERTIFICATES_URL)
      raise InvalidTokenError, 'Unable to fetch Firebase certificates' unless response.is_a?(Net::HTTPSuccess)

      @certificates_expires_at = Time.current + certificates_ttl(response)
      @certificates = JSON.parse(response.body).transform_values do |certificate|
        OpenSSL::X509::Certificate.new(certificate)
      end
    end

    def certificates_ttl(response)
      cache_control = response['cache-control'].to_s
      max_age = cache_control[/max-age=(\d+)/, 1]
      (max_age || 3600).to_i.seconds
    end
  end

  def initialize(token, project_id: ENV['FIREBASE_PROJECT_ID'])
    @token = token.to_s
    @project_id = project_id.to_s
  end

  def verify
    raise ConfigurationError, 'FIREBASE_PROJECT_ID is required' if project_id.empty?
    raise MissingTokenError, 'Authorization token is missing' if token.empty?

    header = JWT.decode(token, nil, false).last
    validate_header!(header)

    certificate = self.class.send(:certificates)[header['kid']]
    raise InvalidTokenError, 'Unknown token key' unless certificate

    payload, = JWT.decode(
      token,
      certificate.public_key,
      true,
      algorithm: 'RS256',
      aud: project_id,
      verify_aud: true,
      iss: "#{ISSUER_PREFIX}#{project_id}",
      verify_iss: true,
      verify_iat: true
    )

    validate_subject!(payload['sub'])
    payload
  rescue JWT::DecodeError, JSON::ParserError, OpenSSL::X509::CertificateError => e
    raise InvalidTokenError, e.message
  end

  private

  attr_reader :token, :project_id

  def validate_header!(header)
    raise InvalidTokenError, 'Invalid token algorithm' unless header['alg'] == 'RS256'
    raise InvalidTokenError, 'Token key id is missing' if header['kid'].to_s.empty?
  end

  def validate_subject!(subject)
    subject = subject.to_s

    raise InvalidTokenError, 'Token subject is missing' if subject.empty?
    raise InvalidTokenError, 'Token subject is invalid' if subject.length > 128
  end
end
