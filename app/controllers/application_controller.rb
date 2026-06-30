class ApplicationController < ActionController::API
  before_action :authenticate_request!

  attr_reader :firebase_token_payload

  rescue_from FirebaseTokenVerifier::Error, with: :render_unauthorized

  private

  def authenticate_request!
    @firebase_token_payload = FirebaseTokenVerifier.verify(bearer_token)
  end

  def bearer_token
    authorization = request.authorization.to_s
    return unless authorization.start_with?('Bearer ')

    authorization.delete_prefix('Bearer ').strip
  end

  def firebase_uid
    firebase_token_payload&.fetch('sub', nil)
  end

  def render_unauthorized(error)
    render json: {
      error: 'unauthorized',
      message: error.message
    }, status: :unauthorized
  end
end
