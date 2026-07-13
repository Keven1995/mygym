require 'test_helper'

module Api
class ExercisesControllerTest < ActionDispatch::IntegrationTest
  setup do
    clear_database!
    @user = User.create!(name: 'Keven', email: 'keven@example.com', firebase_uid: 'firebase-uid-123')
    @other_user = User.create!(name: 'Other', email: 'other@example.com', firebase_uid: 'firebase-uid-999')
  end

  test 'index returns only authenticated user exercises' do
    own = Exercise.create!(user: @user, name: 'Supino', muscle_group: 'Peito', sets: 3, repetitions: 10)
    Exercise.create!(user: @other_user, name: 'Agachamento')

    stub_firebase_token do
      get '/api/exercises', headers: auth_headers
    end

    assert_response :ok

    exercises = JSON.parse(response.body)['exercises']
    assert_equal [own.id.to_s], exercises.map { |exercise| exercise['id'] }
  end

  test 'create persists exercise for authenticated user' do
    stub_firebase_token do
      post '/api/exercises', headers: auth_headers, params: {
        exercise: { name: 'Remada', description: 'Curvada', muscle_group: 'Costas', sets: 4, repetitions: 8 }
      }
    end

    assert_response :created

    exercise = Exercise.find_by(name: 'Remada')
    body = JSON.parse(response.body)
    assert_equal @user.id, exercise.user_id
    assert_equal 'Costas', body.dig('exercise', 'muscle_group')
  end

  test 'create returns validation error for invalid exercise' do
    stub_firebase_token do
      post '/api/exercises', headers: auth_headers, params: { exercise: { name: '', sets: -1 } }
    end

    assert_response :unprocessable_entity
    body = JSON.parse(response.body)
    assert_equal 'validation_error', body['error']
    assert_includes body['details']['name'], "can't be blank"
    assert_includes body['details']['sets'], 'must be greater than or equal to 0'
  end

  test 'show returns authenticated user exercise' do
    exercise = Exercise.create!(user: @user, name: 'Supino')

    stub_firebase_token do
      get "/api/exercises/#{exercise.id}", headers: auth_headers
    end

    assert_response :ok
    assert_equal exercise.id.to_s, JSON.parse(response.body).dig('exercise', 'id')
  end

  test 'show cannot access another user exercise' do
    exercise = Exercise.create!(user: @other_user, name: 'Supino')

    stub_firebase_token do
      get "/api/exercises/#{exercise.id}", headers: auth_headers
    end

    assert_response :not_found
  end

  test 'update changes authenticated user exercise' do
    exercise = Exercise.create!(user: @user, name: 'Supino', sets: 3)

    stub_firebase_token do
      put "/api/exercises/#{exercise.id}", headers: auth_headers, params: { exercise: { name: 'Supino Reto', sets: 5 } }
    end

    assert_response :ok
    exercise.reload
    assert_equal 'Supino Reto', exercise.name
    assert_equal 5, exercise.sets
  end

  test 'destroy removes authenticated user exercise' do
    exercise = Exercise.create!(user: @user, name: 'Supino')

    stub_firebase_token do
      delete "/api/exercises/#{exercise.id}", headers: auth_headers
    end

    assert_response :no_content
    assert_raises Mongoid::Errors::DocumentNotFound do
      exercise.reload
    end
  end
end
end
