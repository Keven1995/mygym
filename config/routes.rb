Rails.application.routes.draw do
  namespace :api do
    get 'health', to: 'health#show'
    resource :me, only: %i[show update], controller: :me
    resources :exercises, only: %i[index show create update destroy]
    get 'workouts/today', to: 'workouts#today'
    resources :workouts, only: %i[index show create update destroy]
    post 'users/sync', to: 'users#sync'
  end
end
