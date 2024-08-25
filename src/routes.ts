import {createRouter, createWebHistory} from "vue-router";
import {ref} from "vue";
import axios from "axios";

const routes = [
    {
        path: "/",
        name: "Home",
        redirect: "/client/home"
    },
    {
        path: "/client",
        name: "Client",
        redirect: "/client/home"
    },
    {
        path: "/client/home",
        name: "ClientHome",
        component: () => import("./components/client/Home.vue")
    },
    {
        path: "/client/login",
        name: "ClientLogin",
        component: () => import("./components/client/Login.vue"),
    },
    {
        path: "/client/register",
        name: "ClientRegister",
        component: () => import("./components/client/Register.vue"),
    },
    {
        path: "/server",
        name: "Server",
        redirect: "/server/home"
    },
    {
        path: "/server/home",
        name: "ServerHome",
        component: () => import("./components/server/Home.vue"),
    },
    {
        path: "/server/login",
        name: "ServerLogin",
        component: () => import("./components/server/Login.vue"),
    },
    {
        path: "/server/register",
        name: "ServerRegister",
        component: () => import("./components/server/Register.vue"),
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// 添加全局前置守卫
router.beforeEach(async (to, from, next) => {
    if (to.name == "ClientHome") {
        const sessionId = ref("");
        const sessionIdFromUrl = to.query.sessionId as string;
        if (sessionIdFromUrl) {
            sessionId.value = sessionIdFromUrl;
            localStorage.setItem('clientSessionId', sessionIdFromUrl);
        } else if (localStorage.getItem('clientSessionId')) {
            sessionId.value = localStorage.getItem('clientSessionId') || '';
        }
        if (sessionId.value == '') {
            // 没有 sessionId，重定向到登录页面
            return next({ name: 'ClientLogin' });
        } else {
            try {
                // 验证 sessionId 是否有效
                const response = await axios.get('http://localhost:8080/auth/home', {
                    params: { sessionId: sessionId.value }
                });
                if (response.data && response.data.data) {
                    localStorage.setItem('clientUsername', response.data.data);
                    next();
                } else {
                    // 如果无效，清除 localStorage 并重定向到登录页面
                    localStorage.removeItem('clientSessionId');
                    next({ name: 'ClientLogin' });
                }
            } catch (error) {
                console.error('验证 sessionId 失败:', error);
                localStorage.removeItem('clientSessionId');
                next({ name: 'ClientLogin' });
            }
        }
    } else if (to.name == "ServerHome") {
        console.log(to)
        const redirectUriFromUrl = to.query.redirect_uri as string || '';
        if (redirectUriFromUrl) {
            localStorage.setItem('redirectUriFromUrl', redirectUriFromUrl);
        }
        const state = to.query.sessionId as string || '';
        console.log("state:" + state)
        if (state) {
            console.log("存了state")
            localStorage.setItem('oAuthState', state);
        }
        const sessionId = ref("");
        sessionId.value = localStorage.getItem('serverSessionId');
        if (sessionId.value == '') {
            // 没有 sessionId，重定向到登录页面
            return next({ name: 'ServerLogin' });
        } else {
            try {
                const response = await axios.get('http://localhost:8081/auth/home', {
                    params: { sessionId: sessionId.value }
                })
                console.log(response.data);
                if (response.data && response.data.data) {
                    localStorage.setItem('serverUsername', response.data.data);
                    next();
                } else {
                    localStorage.removeItem('serverSessionId');
                    next({ name: 'ServerLogin' });
                }
            } catch (error) {
                console.error('验证 sessionId 失败:', error);
                localStorage.removeItem('serverSessionId');
                next({ name: 'ServerLogin' });
            }
        }
    } else {
        // 如果目标路由是登录页面，直接继续导航
        next();
    }
});

export default router;