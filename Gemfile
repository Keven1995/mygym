source 'https://rubygems.org'

ruby file: '.ruby-version'

gem 'rails', '8.1.3'
gem 'puma', '>= 5.0'

gem 'bootsnap', '>= 1.1.0', require: false
gem 'mongoid', '~> 9.1'
gem 'rack-cors', '~> 3.0'
gem 'jwt', '~> 3.2'

group :development, :test do
  gem 'debug', platforms: %i[mri windows], require: 'debug/prelude'
  gem 'dotenv-rails', '~> 3.1'
end

group :development, :test do
  gem 'brakeman', require: false
end

group :development do
  gem 'listen', '~> 3.9'
  gem 'web-console'
end

gem 'tzinfo-data', platforms: %i[windows jruby]
