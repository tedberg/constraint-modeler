import Vue from 'vue';
import Router from 'vue-router';
import Home from './views/Home.vue';
import Simple from './views/Simple.vue';
import Debug from './views/Debug.vue';
import WithProjection from './views/WithProjection.vue';
import Persistent from './views/Persistent.vue';
import Everything from './views/Everything.vue';

Vue.use(Router);

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
      meta: { title: 'Home' }
    },
    {
      path: '/simple',
      name: 'simple',
      component: Simple,
      meta: { title: 'Simple' }
    },
    {
      path: '/debug',
      name: 'debug',
      component: Debug,
      meta: { title: 'Debug' }
    },
    {
      path: '/projection',
      name: 'projection',
      component: WithProjection,
      meta: { title: 'Projection' }
    },
    {
      path: '/persistent',
      name: 'persistent',
      component: Persistent,
      meta: { title: 'Persistent' }
    },
    {
      path: '/everything',
      name: 'everything',
      component: Everything,
      meta: { title: 'Everything' }
    },
    {
      path: '*',
      component: Home,
      meta: { title: 'Home' }
    }
  ]
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title;
  next();
});

router.afterEach((to, from) => {
});

export default router;
