require 'test_helper'

class ExerciseTest < ActiveSupport::TestCase
  test 'defines expected fields and user association' do
    assert_equal String, Exercise.fields['name'].type
    assert_equal String, Exercise.fields['description'].type
    assert_equal String, Exercise.fields['muscle_group'].type
    assert_equal Integer, Exercise.fields['sets'].type
    assert_equal Integer, Exercise.fields['repetitions'].type
    assert_equal User, Exercise.relations['user'].klass
  end

  test 'requires user and name' do
    exercise = Exercise.new

    assert_not exercise.valid?
    assert_includes exercise.errors[:user], 'must exist'
    assert_includes exercise.errors[:name], "can't be blank"
  end

  test 'does not allow negative sets or repetitions' do
    exercise = build_exercise(sets: -1, repetitions: -2)

    assert_not exercise.valid?
    assert_includes exercise.errors[:sets], 'must be greater than or equal to 0'
    assert_includes exercise.errors[:repetitions], 'must be greater than or equal to 0'
  end

  test 'normalizes blank optional text fields' do
    exercise = build_exercise(description: '', muscle_group: '')

    assert exercise.valid?
    assert_nil exercise.description
    assert_nil exercise.muscle_group
  end

  private

  def build_exercise(attributes = {})
    Exercise.new({
      user: build_user,
      name: 'Supino',
      description: 'Banco reto',
      muscle_group: 'Peito',
      sets: 3,
      repetitions: 10
    }.merge(attributes))
  end
end
