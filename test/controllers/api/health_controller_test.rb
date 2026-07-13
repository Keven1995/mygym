require 'test_helper'

module Api
class HealthControllerTest < ActionDispatch::IntegrationTest
  test 'show returns api health status without authentication' do
    get '/api/health'

    assert_response :ok
    assert_equal({ 'status' => 'ok' }, JSON.parse(response.body))
  end
end
end
