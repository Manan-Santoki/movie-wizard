pipeline {
    agent any

    parameters {
        string(name: 'IMAGE_NAME', defaultValue: 'movie-wiz', description: 'Name of the Docker image')
        string(name: 'IMAGE_TAG', defaultValue: 'latest', description: 'Tag for the Docker image')
        string(name: 'DOCKER_COMPOSE_FILE', defaultValue: 'docker-compose.yml', description: 'Path to the Docker Compose file')
        string(name: 'OPENAI_API_KEY', description: 'OpenAI API Key')
        string(name: 'EMAIL_USER', description: 'Email User')
        string(name: 'EMAIL_PW', description: 'Email Password')
        string(name: 'EMAIL_TO', description: 'Recipient Email')
    }

    environment {
        DOCKER_IMAGE = "${params.IMAGE_NAME}:${params.IMAGE_TAG}"
        ENV_FILE = '.env.local'
    }

    stages {
        stage('Setup Environment Variables') {
            steps {
                script {
                    // Write the environment variables to the .env.local file
                    writeFile file: "${ENV_FILE}", text: """
                        OPENAI_API_KEY=${params.OPENAI_API_KEY}
                        EMAIL_USER=${params.EMAIL_USER}
                        EMAIL_PW=${params.EMAIL_PW}
                        EMAIL_TO=${params.EMAIL_TO}
                    """
                    echo "Environment variables written to ${ENV_FILE}"

                }
            }
        }

        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Copy Variables') {
                    steps {
                        script {
                            // Install dependencies using npm
                                                // Ensure the .env.local file is also in the root of the folder
                    sh "cp -f ${ENV_FILE} ${WORKSPACE}/movie-wizard"
                    echo ".env.local file copied to workspace git."

                        }
                    }
                }
        stage('Build Docker Image') {
            steps {
                script {
                    // Build the Docker image using the Dockerfile and the .env.local file in the root of the folder
                    sh "docker build . -t ${DOCKER_IMAGE}"
                    echo "Docker image ${DOCKER_IMAGE} built successfully."
                }
            }
        }

        stage('Deploy with Docker Compose') {
            steps {
                script {
                    // Run the docker-compose to deploy containers
                    sh "docker-compose -f ${params.DOCKER_COMPOSE_FILE} up -d"
                    echo "Docker containers started successfully using ${params.DOCKER_COMPOSE_FILE}."
                }
            }
        }
    }

    post {
        always {
            script {
                // Cleanup unused Docker resources
                sh 'docker system prune -f'
            }
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Please check the logs.'
        }
    }
}
