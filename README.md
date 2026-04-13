# React Analytics Dashboard

Modern React analytics dashboard for the `symfony-task-api-service` backend. It authenticates with the Symfony JWT login endpoint, fetches task data, and derives dashboard analytics client-side.

## Stack

- React 18
- Vite
- JavaScript (ES modules)
- Sass
- React Router
- Recharts

## Features

- JWT login flow against `POST /api/login`
- Protected dashboard route with persisted auth state
- KPI cards for total, completed, in-progress, and overdue tasks
- Charts for task creation over time, status mix, and priority mix
- Date-range filtering based on `createdAt`
- Category filtering mapped to task `priority`
- Loading, empty, and error states
- Dark mode with persistent theme selection
- Lazy-loaded chart bundle
- API abstraction layer in `src/services/api.js`

## Project Structure

```text
react-analytics-dashboard/
├── public/
├── src/
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── Charts.jsx
│   │   │   ├── Filters.jsx
│   │   │   ├── RecentTasks.jsx
│   │   │   └── StatsCards.jsx
│   │   ├── layout/
│   │   │   └── ProtectedRoute.jsx
│   │   └── ui/
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       ├── EmptyState.jsx
│   │       ├── ErrorState.jsx
│   │       ├── Input.jsx
│   │       ├── Loader.jsx
│   │       ├── Select.jsx
│   │       └── ThemeToggle.jsx
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useDashboardData.js
│   │   └── useTheme.js
│   ├── pages/
│   │   ├── DashboardPage.jsx
│   │   └── LoginPage.jsx
│   ├── services/
│   │   └── api.js
│   ├── styles/
│   │   └── main.scss
│   ├── utils/
│   │   └── analytics.js
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create an env file:

```bash
cp .env.example .env
```

3. Set the Symfony API URL for local Vite development:

```env
VITE_API_BASE_URL=http://localhost:8002
```

4. Start the dev server:

```bash
npm run dev
```

## Docker

The dashboard includes an nginx-based production container that proxies `/api/*`
to the Symfony API container on the shared `task_api_network`.

Start the API first:

```powershell
cd ../symfony-task-api-service
./docker-up.ps1
docker compose exec app php bin/console doctrine:migrations:migrate --no-interaction
docker compose exec app php bin/console app:seed-demo-data
```

Then start the dashboard:

```powershell
./docker-up.ps1
```

The dashboard is exposed on `http://localhost:3000` by default. The script falls
back to the next free port up to `3100`.

## Symfony API Integration

Expected endpoints:

- `POST /api/login`
- `GET /api/tasks?page=1&limit=100&priority=high&sort=createdAt&direction=desc`

Demo users after seeding:

- `alex@example.com / Password123`
- `jamie@example.com / Password123`

Login request example:

```js
import { login } from './src/services/api';

const session = await login({
  email: 'owner@example.com',
  password: 'Password123',
});
```

Task fetch example:

```js
import { getTasks } from './src/services/api';

const result = await getTasks({
  token: session.token,
  params: {
    page: 1,
    limit: 100,
    priority: 'high',
    sort: 'createdAt',
    direction: 'desc',
  },
});
```

## Notes

- Analytics are computed on the client from task records returned by the API.
- The dashboard assumes “category” means task priority.
- The date filter and time-series chart use `createdAt`.
- In Docker, the frontend talks to the API through nginx at `/api`.
- In local Vite development, the backend allows `http://localhost:5173` and `http://localhost:3000` via CORS.
- If task volume grows substantially, the next step should be a dedicated backend analytics endpoint.
