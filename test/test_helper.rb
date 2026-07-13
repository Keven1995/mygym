ENV['RAILS_ENV'] ||= 'test'
require_relative '../config/environment'
require 'rails/test_help'

class ActiveSupport::TestCase
  def clear_database!
    Mongoid.default_client.collections.each do |collection|
      next if collection.name.start_with?('system.')

      collection.delete_many
    end
  end

  def build_user(attributes = {})
    User.new({
      name: 'Keven',
      email: 'keven@example.com',
      firebase_uid: 'firebase-uid-123',
      photo_url: 'https://example.com/photo.jpg'
    }.merge(attributes))
  end
end

class ActionDispatch::IntegrationTest
  def clear_database!
    Mongoid.default_client.collections.each do |collection|
      next if collection.name.start_with?('system.')

      collection.delete_many
    end
  end

  def auth_headers(token: 'firebase-id-token')
    { 'Authorization' => "Bearer #{token}" }
  end

  def firebase_payload(attributes = {})
    {
      'sub' => 'firebase-uid-123',
      'email' => 'keven@example.com',
      'name' => 'Keven',
      'picture' => 'https://example.com/photo.jpg'
    }.merge(attributes)
  end

  def stub_firebase_token(payload = firebase_payload, token: 'firebase-id-token')
    with_firebase_token_verifier(->(received_token) {
      assert_equal token, received_token
      payload
    }) do
      yield
    end
  end

  def with_firebase_token_verifier(verifier)
    original_verify = FirebaseTokenVerifier.method(:verify)
    FirebaseTokenVerifier.define_singleton_method(:verify) { |token| verifier.call(token) }

    yield
  ensure
    FirebaseTokenVerifier.define_singleton_method(:verify) { |token| original_verify.call(token) }
  end
end

class ActiveSupport::TestCase
  teardown do
    clear_database!
  end
end

class ActionDispatch::IntegrationTest
  teardown do
    clear_database!
  end
end
