class Workout
  include Mongoid::Document
  include Mongoid::Timestamps

  WEEKDAYS = %w[monday tuesday wednesday thursday friday saturday sunday].freeze

  belongs_to :user

  field :name, type: String
  field :weekday, type: String
  field :exercises, type: Array, default: []

  index({ user_id: 1, weekday: 1 })

  validates :name, presence: true
  validates :user, presence: { message: 'must exist' }
  validates :weekday, presence: true, inclusion: { in: WEEKDAYS }
  validate :exercises_are_present
  validate :exercise_names_are_present

  before_validation :normalize_weekday
  before_validation :normalize_exercises

  private

  def normalize_weekday
    self.weekday = weekday.to_s.strip.downcase if weekday.present?
  end

  def normalize_exercises
    self.exercises = Array(exercises).map do |exercise|
      exercise.to_h.slice('name', 'description', 'muscle_group', 'sets', 'repetitions')
    end
  end

  def exercises_are_present
    errors.add(:exercises, 'must have at least one exercise') if exercises.blank?
  end

  def exercise_names_are_present
    return if exercises.blank?

    errors.add(:exercises, 'must include exercise names') if exercises.any? { |exercise| exercise['name'].blank? }
  end
end
