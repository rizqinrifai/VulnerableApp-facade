pipeline {
    agent {
        label 'jenkins-agent'
    }

    environment {
        SONARQUBE_SERVER = 'sonar-scanner-jenkins'
        SONARQUBE_SCANNER = 'sonar-scanner-jenkins'
        SONAR_HOST_URL = 'https://sonar.teamdev.id/'
        SONAR_AUTH_TOKEN = credentials('token-sonarqube')
        DOCKER_HUB_CREDENTIALS = credentials('docker-login-rizqi') 
        DOCKER_IMAGE = 'rnrifai/rnrifai-page:latest' 
        ZAP_DOCKER_IMAGE = 'ghcr.io/zaproxy/zaproxy:stable'
    }

    parameters {
        // Dropdown untuk memilih antara branch atau tag
        choice(name: 'BRANCH_OR_TAG', choices: ['branch', 'tag'], description: 'Pilih antara branch atau tag')
        string(name: 'BRANCH_TAG_NAME', defaultValue: 'main', description: 'Nama branch atau tag yang akan digunakan')
        choice(name: 'ACTION', choices: ['Scan', 'Release', 'Restart'], description: 'Pilih aksi yang akan dijalankan')
    }

    stages {
        stage('Prepare') {
            steps {
                script {
                    echo "Branch/Tag yang digunakan: ${params.BRANCH_TAG_NAME} (type: ${params.BRANCH_OR_TAG})"
                    echo "Aksi yang dipilih: ${params.ACTION}"
                }
            }
        }

        // Hanya menjalankan proses Scan
        stage('[SCA] Trivy Scan') {
            when {
                expression { return params.ACTION == 'Scan' || params.ACTION == 'Release' }
            }
            steps {
                script {
                    echo 'Scanning for vulnerabilities using Trivy...'
                    sh 'trivy fs --format=json --output=trivy.json .'
                }
                archiveArtifacts artifacts: 'trivy.json'
            }
        }

        // Hanya menjalankan SonarQube saat "Scan" atau "Release"
        stage('[SAST] SonarQube') {
            when {
                expression { return params.ACTION == 'Scan' || params.ACTION == 'Release' }
            }
            steps {
                script {
                    def scannerHome = tool name: env.SONARQUBE_SCANNER, type: 'hudson.plugins.sonar.SonarRunnerInstallation'
                    withSonarQubeEnv(env.SONARQUBE_SERVER) {
                        sh "${scannerHome}/bin/sonar-scanner \
                            -Dsonar.projectKey=vulnerableApp-Test \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=${SONAR_HOST_URL} \
                            -Dsonar.login=${SONAR_AUTH_TOKEN}"
                    }
                }
            }
        }

        // Menjalankan build/deploy hanya pada saat "Release"
        stage('Deploy-Stagging') {
            when {
                expression { return params.ACTION == 'Release' }
            }
            steps {
                sh 'docker-compose pull'
                sh 'docker-compose up -d' 
            }
        }

        stage('[DAST] OWASP ZAP') {
            when {
                expression { return params.ACTION == 'Release' }
            }
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    script {
                        echo 'Running OWASP ZAP scan...'
                        sh 'docker --version'  // Check Docker version to ensure Docker is running
                        sh 'mkdir -p ${WORKSPACE}/zap-reports'  // Ensure the directory exists
                        sh 'docker pull ghcr.io/zaproxy/zaproxy:stable'
                        sh '''
                            docker run --user $(id -u) \
                                -v ${WORKSPACE}/zap-reports:/zap/wrk \
                                ghcr.io/zaproxy/zaproxy:stable \
                                zap-full-scan.py -t http://139.162.18.93:8081 -r /zap/wrk/zap-report.html
                        '''
                        // Check if the report was generated
                        sh 'test -f ${WORKSPACE}/zap-reports/zap-report.html'
                    }
                    sh 'cp ${WORKSPACE}/zap-reports/zap-report.html ./zap-report.html'
                    archiveArtifacts artifacts: 'zap-report.html'
                }
            }
        }

        stage('[DAST] Dastardly') {
            when {
                expression { return params.ACTION == 'Release' }
            }
            steps {
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    script {
                        sh 'docker pull public.ecr.aws/portswigger/dastardly:latest'
                        sh '''
                        docker run --user $(id -u) -v ${WORKSPACE}:${WORKSPACE}:rw \
                        -e BURP_START_URL=http://139.162.18.93:8081 \
                        -e BURP_REPORT_FILE_PATH=${WORKSPACE}/dastardly-report.xml \
                        public.ecr.aws/portswigger/dastardly:latest
                        '''
                    }
                }
                archiveArtifacts artifacts: 'dastardly-report.xml', allowEmptyArchive: true
            }
        }

        stage('Deploy-Prod') {
            when {
                expression { return params.ACTION == 'Release' }
            }
            steps {
                sh 'echo "Deploying to Production"' 
            }
        }

        stage('Restart Pipeline') {
            when {
                expression { return params.ACTION == 'Restart' }
            }
            steps {
                echo 'Me-restart pipeline...'
                // Tambahkan logika restart jika diperlukan
            }
        }
    }

    post {
        always {
            junit testResults: 'dastardly-report.xml', skipPublishingChecks: true
        }
        success {
            echo "Post Success"
            discordSend description: "Jenkins Pipeline Build", footer: "Pipeline Success", link: env.BUILD_URL, result: currentBuild.currentResult, title: JOB_NAME, webhookURL: "https://discordapp.com/api/webhooks/1245658580485541958/-qTrq_-tzCe6HliVp-U2epamzlh6AN-c2bbzU5FFvJXgNzzz_PxlshYKTtAxI-6gKRVw"
        }
        failure {
            echo "Post Failure"
            discordSend description: "Jenkins Pipeline Build", footer: "Pipeline Failure", link: env.BUILD_URL, result: currentBuild.currentResult, title: JOB_NAME, webhookURL: "https://discordapp.com/api/webhooks/1245658580485541958/-qTrq_-tzCe6HliVp-U2epamzlh6AN-c2bbzU5FFvJXgNzzz_PxlshYKTtAxI-6gKRVw"
        }
    }
}
