import { createRouter, createWebHistory } from "vue-router";
import ExamComponent from "../components/ExamComponent.vue";

const routes = [
  {
    path: "/",
    name: "Exam",
    component: ExamComponent,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
