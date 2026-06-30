namespace :backend do
  desc 'Check required backend environment variables'
  task check: :environment do
    required_variables = %w[MONGODB_URI FIREBASE_PROJECT_ID]
    missing_variables = required_variables.select { |key| ENV[key].to_s.empty? }

    abort "Missing environment variables: #{missing_variables.join(', ')}" if missing_variables.any?

    puts 'Backend environment configuration OK'
  end

  namespace :mongodb do
    desc 'Ping the configured MongoDB client'
    task ping: :environment do
      Mongoid.default_client.command(ping: 1)
      puts 'MongoDB connection OK'
    rescue StandardError => e
      abort "MongoDB connection failed: #{e.class}: #{e.message}"
    end
  end
end
