require 'test_helper'

module Api
class MeControllerTest < ActionDispatch::IntegrationTest
  setup do
    clear_database!
    @user = User.create!(name: 'Keven', email: 'keven@example.com', firebase_uid: 'firebase-uid-123', photo_url: 'old.jpg')
  end

  test 'show returns authenticated user profile' do
    stub_firebase_token do
      get '/api/me', headers: auth_headers
    end

    assert_response :ok

    body = JSON.parse(response.body)
    assert_equal @user.id.to_s, body.dig('user', 'id')
    assert_equal 'Keven', body.dig('user', 'name')
    assert_equal 'keven@example.com', body.dig('user', 'email')
    assert_equal 'old.jpg', body.dig('user', 'photo_url')
  end

  test 'show returns not found when authenticated user was not synced' do
    @user.destroy!

    stub_firebase_token do
      get '/api/me', headers: auth_headers
    end

    assert_response :not_found
    assert_equal 'not_found', JSON.parse(response.body)['error']
  end

  test 'update changes allowed profile fields' do
    stub_firebase_token do
      put '/api/me', headers: auth_headers, params: {
        user: { name: 'Novo Nome', email: 'Novo@Example.COM', photo_url: 'new.jpg', firebase_uid: 'ignored' }
      }
    end

    assert_response :ok

    @user.reload
    body = JSON.parse(response.body)
    assert_equal 'Novo Nome', @user.name
    assert_equal 'novo@example.com', @user.email
    assert_equal 'new.jpg', @user.photo_url
    assert_equal 'firebase-uid-123', @user.firebase_uid
    assert_equal 'novo@example.com', body.dig('user', 'email')
  end

  test 'update returns validation error for invalid profile' do
    stub_firebase_token do
      put '/api/me', headers: auth_headers, params: { user: { name: '' } }
    end

    assert_response :unprocessable_entity
    body = JSON.parse(response.body)
    assert_equal 'validation_error', body['error']
    assert_includes body['details']['name'], "can't be blank"
  end
end
end
