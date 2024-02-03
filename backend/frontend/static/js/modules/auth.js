import { getCookie} from './utils.js'

async function authUser() {
	try {
        const csrfToken = getCookie('csrftoken');
        console.log('CSRF Token in cookie REGISTER:', csrfToken);
        const baseURL = window.location.protocol + '//' + window.location.hostname + (window.location.port ? ':' + window.location.port : '');
		window.location.href = 'https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-e95dac742f419c01abf9f266b8219d8be7c13613ebcc4b3a64edc9e84beac84c&redirect_uri=https%3A%2F%2Flocalhost%3A8000%2Fhome&response_type=code'
    }
    catch (error) {
        console.error('AUTHUSER Error registering user:', error);
    }
}

export { authUser }