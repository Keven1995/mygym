require 'test_helper'

class WorkoutTest < ActiveSupport::TestCase
  test 'defines expected fields and user association' do
    assert_equal String, Workout.fields['name'].type
    assert_equal String, Workout.fields['weekday'].type
    assert_equal Array, Workout.fields['exercises'].type
    assert_equal User, Workout.relations['user'].klass
  end

  test 'requires user, name, weekday and at least one exercise' do
    workout = Workout.new

    assert_not workout.valid?
    assert_includes workout.errors[:user], 'must exist'
    assert_includes workout.errors[:name], "can't be blank"
    assert_includes workout.errors[:weekday], "can't be blank"
    assert_includes workout.errors[:exercises], 'must have at least one exercise'
  end

  test 'allows only supported weekdays' do
    workout = build_workout(weekday: 'holiday')

    assert_not workout.valid?
    assert_includes workout.errors[:weekday], 'is not included in the list'
  end

  test 'requires exercise names inside workout' do
    workout = build_workout(exercises: [{ name: '', sets: 3, repetitions: 10 }])

    assert_not workout.valid?
    assert_includes workout.errors[:exercises], 'must include exercise names'
  end

  private

  def build_workout(attributes = {})
    Workout.new({
      user: build_user,
      name: 'Treino A',
      weekday: 'monday',
      exercises: [
        { name: 'Supino', description: 'Banco reto', muscle_group: 'Peito', sets: 3, repetitions: 10 }
      ]
    }.merge(attributes))
  end
end
