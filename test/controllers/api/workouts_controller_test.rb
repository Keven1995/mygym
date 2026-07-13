require 'test_helper'

module Api
class WorkoutsControllerTest < ActionDispatch::IntegrationTest
  setup do
    clear_database!
    @user = User.create!(name: 'Keven', email: 'keven@example.com', firebase_uid: 'firebase-uid-123')
    @other_user = User.create!(name: 'Other', email: 'other@example.com', firebase_uid: 'firebase-uid-999')
  end

  test 'index returns only authenticated user workouts' do
    own = Workout.create!(user: @user, name: 'Treino A', weekday: 'monday', exercises: workout_exercises)
    Workout.create!(user: @other_user, name: 'Treino B', weekday: 'tuesday', exercises: workout_exercises)

    stub_firebase_token do
      get '/api/workouts', headers: auth_headers
    end

    assert_response :ok

    workouts = JSON.parse(response.body)['workouts']
    assert_equal [own.id.to_s], workouts.map { |workout| workout['id'] }
  end

  test 'create persists workout for authenticated user' do
    stub_firebase_token do
      post '/api/workouts', headers: auth_headers, params: {
        workout: { name: 'Treino A', weekday: 'monday', exercises: workout_exercises }
      }
    end

    assert_response :created

    workout = Workout.find_by(name: 'Treino A')
    body = JSON.parse(response.body)
    assert_equal @user.id, workout.user_id
    assert_equal 'monday', body.dig('workout', 'weekday')
    assert_equal 'Supino', body.dig('workout', 'exercises', 0, 'name')
  end

  test 'create returns validation error for invalid workout' do
    stub_firebase_token do
      post '/api/workouts', headers: auth_headers, params: { workout: { name: '', weekday: 'holiday', exercises: [] } }
    end

    assert_response :unprocessable_entity
    body = JSON.parse(response.body)
    assert_equal 'validation_error', body['error']
    assert_includes body['details']['name'], "can't be blank"
    assert_includes body['details']['weekday'], 'is not included in the list'
    assert_includes body['details']['exercises'], 'must have at least one exercise'
  end

  test 'show returns authenticated user workout' do
    workout = Workout.create!(user: @user, name: 'Treino A', weekday: 'monday', exercises: workout_exercises)

    stub_firebase_token do
      get "/api/workouts/#{workout.id}", headers: auth_headers
    end

    assert_response :ok
    assert_equal workout.id.to_s, JSON.parse(response.body).dig('workout', 'id')
  end

  test 'show cannot access another user workout' do
    workout = Workout.create!(user: @other_user, name: 'Treino A', weekday: 'monday', exercises: workout_exercises)

    stub_firebase_token do
      get "/api/workouts/#{workout.id}", headers: auth_headers
    end

    assert_response :not_found
  end

  test 'update changes authenticated user workout' do
    workout = Workout.create!(user: @user, name: 'Treino A', weekday: 'monday', exercises: workout_exercises)

    stub_firebase_token do
      put "/api/workouts/#{workout.id}", headers: auth_headers, params: {
        workout: { name: 'Treino B', weekday: 'tuesday', exercises: [{ name: 'Agachamento', sets: 4, repetitions: 8 }] }
      }
    end

    assert_response :ok
    workout.reload
    assert_equal 'Treino B', workout.name
    assert_equal 'tuesday', workout.weekday
    assert_equal 'Agachamento', workout.exercises.first['name']
  end

  test 'destroy removes authenticated user workout' do
    workout = Workout.create!(user: @user, name: 'Treino A', weekday: 'monday', exercises: workout_exercises)

    stub_firebase_token do
      delete "/api/workouts/#{workout.id}", headers: auth_headers
    end

    assert_response :no_content
    assert_raises Mongoid::Errors::DocumentNotFound do
      workout.reload
    end
  end

  test 'today returns workout for current weekday' do
    monday = Date.new(2026, 7, 13)
    workout = Workout.create!(user: @user, name: 'Treino Segunda', weekday: 'monday', exercises: workout_exercises)
    Workout.create!(user: @user, name: 'Treino Terca', weekday: 'tuesday', exercises: workout_exercises)

    travel_to monday do
      stub_firebase_token do
        get '/api/workouts/today', headers: auth_headers
      end
    end

    assert_response :ok
    body = JSON.parse(response.body)
    assert_equal workout.id.to_s, body.dig('workout', 'id')
    assert_equal 'Treino Segunda', body.dig('workout', 'name')
  end

  test 'today returns null workout when none is registered for current weekday' do
    travel_to Date.new(2026, 7, 13) do
      stub_firebase_token do
        get '/api/workouts/today', headers: auth_headers
      end
    end

    assert_response :ok
    body = JSON.parse(response.body)
    assert_nil body['workout']
    assert_equal 'Nenhum treino cadastrado para hoje', body['message']
  end

  private

  def workout_exercises
    [{ name: 'Supino', description: 'Banco reto', muscle_group: 'Peito', sets: 3, repetitions: 10 }]
  end
end
end
