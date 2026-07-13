require 'test_helper'

module Api
class UsersControllerTest < ActionDispatch::IntegrationTest
  setup do
    clear_database!
  end

  test 'sync creates user from authenticated firebase token' do
    payload = firebase_payload(
      'sub' => 'firebase-uid-123',
      'email' => 'keven@example.com',
      'name' => 'Keven',
      'picture' => 'https://example.com/photo.jpg'
    )

    stub_firebase_token(payload) do
      post '/api/users/sync', headers: auth_headers, params: {
        user: {
          firebase_uid: 'ignored-body-uid',
          name: 'Ignored Name'
        }
      }
    end

    assert_response :created

    user = User.find_by(firebase_uid: 'firebase-uid-123')
    response_body = JSON.parse(response.body)

    assert_equal 'Keven', user.name
    assert_equal 'keven@example.com', user.email
    assert_equal 'https://example.com/photo.jpg', user.photo_url
    assert_equal user.id.to_s, response_body.dig('user', 'id')
    assert_equal 'firebase-uid-123', response_body.dig('user', 'firebase_uid')
  end

  test 'sync updates existing user basic data' do
    User.create!(
      name: 'Old Name',
      email: 'old@example.com',
      firebase_uid: 'firebase-uid-123',
      photo_url: 'https://example.com/old.jpg'
    )

    payload = firebase_payload(
      'sub' => 'firebase-uid-123',
      'email' => 'new@example.com',
      'name' => 'New Name',
      'picture' => 'https://example.com/new.jpg'
    )

    stub_firebase_token(payload) do
      post '/api/users/sync', headers: auth_headers
    end

    assert_response :ok

    user = User.find_by(firebase_uid: 'firebase-uid-123')
    response_body = JSON.parse(response.body)

    assert_equal 'New Name', user.name
    assert_equal 'new@example.com', user.email
    assert_equal 'https://example.com/new.jpg', user.photo_url
    assert_equal 'New Name', response_body.dig('user', 'name')
  end

  test 'sync returns unauthorized when token is invalid' do
    with_firebase_token_verifier(->(_token) { raise FirebaseTokenVerifier::InvalidTokenError, 'Invalid token' }) do
      post '/api/users/sync', headers: auth_headers
    end

    assert_response :unauthorized

    response_body = JSON.parse(response.body)
    assert_equal 'unauthorized', response_body['error']
    assert_equal 'Invalid token', response_body['message']
  end

  test 'sync returns unprocessable entity when authenticated payload is incomplete' do
    payload = firebase_payload('sub' => 'firebase-uid-123', 'email' => nil, 'name' => nil, 'picture' => nil)

    stub_firebase_token(payload) do
      post '/api/users/sync', headers: auth_headers
    end

    assert_response :unprocessable_entity

    response_body = JSON.parse(response.body)
    assert_equal 'validation_error', response_body['error']
    assert_includes response_body['details']['name'], "can't be blank"
    assert_includes response_body['details']['email'], "can't be blank"
  end

end
end
