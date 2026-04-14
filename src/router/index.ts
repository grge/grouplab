import { createRouter, createWebHistory } from 'vue-router'
import GroupView from '@/views/GroupView.vue'
import { encodePres } from '@/utils/share'

const defaultPres = encodePres({ g: ['a', 'b'], r: ['aaa', 'bb', 'abababab'] })

const routes = [
  { path: '/', redirect: `/g/${defaultPres}` },
  { path: '/g', redirect: `/g/${defaultPres}` },
  { path: '/g/:pres?', name: 'group', component: GroupView },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})
