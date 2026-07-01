class User
  include Mongoid::Document
  include Mongoid::Timestamps

  field :name, type: String
  field :email, type: String
  field :photo_url, type: String
  field :firebase_uid, type: String

  index({ email: 1 }, { unique: true })
  index({ firebase_uid: 1 }, { unique: true })

  validates :name, presence: true
  validates :email, presence: true
  validates :firebase_uid, presence: true

  before_validation :normalize_email

  private

  def normalize_email
    self.email = email.to_s.strip.downcase if email.present?
  end
end
