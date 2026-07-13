class Exercise
  include Mongoid::Document
  include Mongoid::Timestamps

  belongs_to :user

  field :name, type: String
  field :description, type: String
  field :muscle_group, type: String
  field :sets, type: Integer, default: 0
  field :repetitions, type: Integer, default: 0

  index({ user_id: 1 })

  validates :name, presence: true
  validates :user, presence: { message: 'must exist' }
  validates :sets, numericality: { greater_than_or_equal_to: 0, only_integer: true }, allow_nil: true
  validates :repetitions, numericality: { greater_than_or_equal_to: 0, only_integer: true }, allow_nil: true

  before_validation :normalize_blank_fields

  private

  def normalize_blank_fields
    self.description = nil if description.blank?
    self.muscle_group = nil if muscle_group.blank?
  end
end
