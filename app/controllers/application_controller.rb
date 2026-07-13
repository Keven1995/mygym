class ApplicationController < ActionController::API
  before_action :authenticate_request!

  attr_reader :firebase_token_payload

  rescue_from FirebaseTokenVerifier::Error, with: :render_unauthorized
  rescue_from Mongoid::Errors::DocumentNotFound, with: :render_not_found

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

  def current_user
    @current_user ||= User.find_by(firebase_uid: firebase_uid)
  end

  def require_current_user!
    return if current_user

    render_not_found
  end

  def render_validation_error(record, message: 'Validation failed')
    render json: {
      error: 'validation_error',
      message: message,
      details: record.errors.messages
    }, status: :unprocessable_entity
  end

  def render_not_found(_error = nil)
    render json: {
      error: 'not_found',
      message: 'Resource not found'
    }, status: :not_found
  end

  def render_unauthorized(error)
    render json: {
      error: 'unauthorized',
      message: error.message
    }, status: :unauthorized
  end
end
