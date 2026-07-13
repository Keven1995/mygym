Rails.application.routes.draw do
  namespace :api do
    post 'users/sync', to: 'users#sync'
  end
end
