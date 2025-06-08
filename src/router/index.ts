import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/App.vue'

const routes = [
  { path: '/g/:pres?', name: 'group', component: Home },
  { path: '/:pathMatch(.*)*', redirect: '/g/' },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})
