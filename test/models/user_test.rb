require 'test_helper'

class UserTest < ActiveSupport::TestCase
  test 'defines expected fields' do
    assert_equal String, User.fields['name'].type
    assert_equal String, User.fields['email'].type
    assert_equal String, User.fields['photo_url'].type
    assert_equal String, User.fields['firebase_uid'].type
  end

  test 'requires name' do
    user = build_user(name: nil)

    assert_not user.valid?
    assert_includes user.errors[:name], "can't be blank"
  end

  test 'requires email' do
    user = build_user(email: nil)

    assert_not user.valid?
    assert_includes user.errors[:email], "can't be blank"
  end

  test 'requires firebase uid' do
    user = build_user(firebase_uid: nil)

    assert_not user.valid?
    assert_includes user.errors[:firebase_uid], "can't be blank"
  end

  test 'normalizes email before validation' do
    user = build_user(email: '  USER@Example.COM  ')

    user.valid?

    assert_equal 'user@example.com', user.email
  end

  test 'defines unique indexes for email and firebase uid' do
    indexes = User.index_specifications.map do |specification|
      [specification.key, specification.options]
    end

    assert_includes indexes, [{ email: 1 }, { unique: true }]
    assert_includes indexes, [{ firebase_uid: 1 }, { unique: true }]
  end

end
