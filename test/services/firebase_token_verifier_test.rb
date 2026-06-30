require 'test_helper'

class FirebaseTokenVerifierTest < ActiveSupport::TestCase
  test 'raises configuration error when firebase project id is missing' do
    error = assert_raises(FirebaseTokenVerifier::ConfigurationError) do
      FirebaseTokenVerifier.new('token', project_id: '').verify
    end

    assert_equal 'FIREBASE_PROJECT_ID is required', error.message
  end

  test 'raises missing token error when token is blank' do
    error = assert_raises(FirebaseTokenVerifier::MissingTokenError) do
      FirebaseTokenVerifier.new('', project_id: 'mygym-test').verify
    end

    assert_equal 'Authorization token is missing', error.message
  end
end
