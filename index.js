import axios from 'axios'
import { loadProgressBar } from 'axios-progress-bar'
import 'axios-progress-bar/dist/nprogress.css'

export default function install (Vue, { store, router }) {
  // create instance and set base url
  let instance = axios.create({
    baseURL: process.env.VUE_APP_API_URL
  })

  // setting token
  instance.interceptors.request.use(config => {
    let token = store.getters['auth/tokenRecall']

    if (token) {
      config.headers['Authorization'] = `Bearer ${token.value}`

      return config
    }

    return config
  })

  instance.interceptors.response.use(
    response => response,
    error => {
      if (error.response.status === 401) {
        store.commit('auth/CLEAR_TOKEN')
        router.push('/login')
      }

      return Promise.reject(error)
    }
  )

  instance.interceptors.response.use(
    response => response,
    error => {
      if (error.response.status === 403) {
        router.push('/403')
      }

      return Promise.reject(error)
    }
  )

  loadProgressBar(null, instance)

  // inject global instance
  Vue.axios = instance

  // inject instance to components
  Object.defineProperties(Vue.prototype, {
    $http: {
      get () {
        return instance
      }
    },

    axios: {
      get () {
        return instance
      }
    }
  })
}
