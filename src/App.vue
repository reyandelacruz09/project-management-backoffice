<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { createApi } from './api';

const token = ref(sessionStorage.getItem('backoffice_token') || '');
const user = ref(null);
const projects = ref([]);
const teams = ref([]);
const selectedProject = ref(null);
const tasks = ref([]);
const page = ref('overview');
const search = ref('');
const busy = ref(false);
const error = ref('');
const notice = ref('');
const loginForm = ref({ email: '', password: '' });
const projectForm = ref({ name: '', description: '', status: 'planning', start_date: '', end_date: '', team_id: '' });
const taskForm = ref({ title: '', priority: 'medium', status: 'todo', due_date: '' });
const editingProject = ref(null);
const api = computed(() => createApi(token.value));

const visibleProjects = computed(() => {
  const query = search.value.trim().toLowerCase();
  return query ? projects.value.filter((project) => `${project.name} ${project.status} ${project.team?.name || ''}`.toLowerCase().includes(query)) : projects.value;
});
const openTasks = computed(() => tasks.value.filter((task) => task.status !== 'done').length);
const completedTasks = computed(() => tasks.value.filter((task) => task.status === 'done').length);

function say(message) { notice.value = message; window.setTimeout(() => { notice.value = ''; }, 3200); }
function fail(exception) { error.value = exception.message || 'Something went wrong.'; }
function clearError() { error.value = ''; }

async function signIn() {
  busy.value = true; clearError();
  try {
    const result = await createApi('').login(loginForm.value.email, loginForm.value.password);
    token.value = result.token;
    sessionStorage.setItem('backoffice_token', result.token);
    user.value = result.user;
    await loadDashboard();
  } catch (exception) { fail(exception); }
  finally { busy.value = false; }
}

async function loadDashboard() {
  busy.value = true; clearError();
  try {
    const [projectResponse, teamResponse, me] = await Promise.all([api.value.projects(), api.value.teams(), api.value.me()]);
    projects.value = projectResponse.data || projectResponse;
    teams.value = teamResponse.data || teamResponse;
    user.value = me;
    if (selectedProject.value) await openProject(selectedProject.value.id, false);
  } catch (exception) { fail(exception); }
  finally { busy.value = false; }
}

async function openProject(id, changePage = true) {
  clearError();
  try {
    const project = await api.value.project(id);
    selectedProject.value = project;
    tasks.value = project.tasks || await api.value.tasks(id);
    if (changePage) page.value = 'projects';
  } catch (exception) { fail(exception); }
}

function startProject(project = null) {
  editingProject.value = project;
  projectForm.value = project ? {
    name: project.name, description: project.description || '', status: project.status,
    start_date: project.start_date || '', end_date: project.end_date || '', team_id: project.team_id || project.team?.id || '',
  } : { name: '', description: '', status: 'planning', start_date: '', end_date: '', team_id: '' };
  document.getElementById('project-dialog')?.showModal();
}

async function saveProject() {
  clearError();
  const data = { ...projectForm.value, team_id: projectForm.value.team_id || null };
  try {
    if (editingProject.value) await api.value.updateProject(editingProject.value.id, data);
    else await api.value.createProject(data);
    document.getElementById('project-dialog')?.close();
    say(editingProject.value ? 'Project updated' : 'Project created');
    await loadDashboard();
  } catch (exception) { fail(exception); }
}

async function removeProject(project) {
  if (!window.confirm(`Delete “${project.name}”? This cannot be undone.`)) return;
  try {
    await api.value.deleteProject(project.id);
    if (selectedProject.value?.id === project.id) { selectedProject.value = null; tasks.value = []; }
    say('Project deleted'); await loadDashboard();
  } catch (exception) { fail(exception); }
}

async function addTask() {
  if (!selectedProject.value || !taskForm.value.title.trim()) return;
  clearError();
  try {
    await api.value.createTask(selectedProject.value.id, { ...taskForm.value, due_date: taskForm.value.due_date || null });
    taskForm.value = { title: '', priority: 'medium', status: 'todo', due_date: '' };
    await openProject(selectedProject.value.id, false); say('Task added');
  } catch (exception) { fail(exception); }
}

async function changeTaskStatus(task, status) {
  try { await api.value.updateTask(selectedProject.value.id, task.id, { status }); await openProject(selectedProject.value.id, false); }
  catch (exception) { fail(exception); }
}

async function removeTask(task) {
  if (!window.confirm(`Delete task “${task.title}”?`)) return;
  try { await api.value.deleteTask(selectedProject.value.id, task.id); await openProject(selectedProject.value.id, false); say('Task deleted'); }
  catch (exception) { fail(exception); }
}

async function signOut() {
  if (!token.value) return;
  const currentApi = api.value;
  token.value = '';
  sessionStorage.removeItem('backoffice_token');
  try { await currentApi.logout(); } catch { /* Local session is cleared even if the token was already invalid. */ }
  user.value = null; projects.value = []; teams.value = []; selectedProject.value = null;
  page.value = 'overview';
}

function handleUnauthorized() { signOut(); }
onMounted(() => {
  window.addEventListener('api-unauthorized', handleUnauthorized);
  if (token.value) loadDashboard();
});
onUnmounted(() => window.removeEventListener('api-unauthorized', handleUnauthorized));
</script>

<template>
  <main v-if="!token" class="login-shell">
    <section class="login-card">
      <div class="brand-mark">PD</div>
      <p class="eyebrow">PROJECT MANAGEMENT</p>
      <h1>Welcome back</h1>
      <p class="muted">Sign in to your back office workspace.</p>
      <form class="stack" @submit.prevent="signIn">
        <label>Email address<input v-model="loginForm.email" type="email" autocomplete="username" placeholder="you@example.com" required /></label>
        <label>Password<input v-model="loginForm.password" type="password" autocomplete="current-password" placeholder="Your password" required /></label>
        <p v-if="error" class="error-message">{{ error }}</p>
        <button class="button primary full" :disabled="busy">{{ busy ? 'Signing in…' : 'Sign in' }} <span>→</span></button>
      </form>
      <p class="login-foot">Secure workspace · Powered by your Laravel API</p>
    </section>
  </main>

  <div v-else class="app-shell">
    <aside class="sidebar">
      <a class="brand" href="#" @click.prevent="page = 'overview'; selectedProject = null"><span class="brand-mark small">PD</span><span><strong>Project Desk</strong><small>BACK OFFICE</small></span></a>
      <div class="nav-caption">WORKSPACE</div>
      <button class="nav-item" :class="{ active: page === 'overview' }" @click="page = 'overview'; selectedProject = null"><span class="nav-icon">⌂</span>Overview</button>
      <button class="nav-item" :class="{ active: page === 'projects' }" @click="page = 'projects'; selectedProject = null"><span class="nav-icon">▤</span>Projects <span class="nav-count">{{ projects.length }}</span></button>
      <button class="nav-item" :class="{ active: page === 'teams' }" @click="page = 'teams'; selectedProject = null"><span class="nav-icon">♧</span>Teams <span class="nav-count">{{ teams.length }}</span></button>
      <div class="sidebar-bottom"><div class="online-dot"></div><span>Connected to Laravel API</span><button class="icon-button" title="Refresh data" @click="loadDashboard">↻</button></div>
    </aside>

    <section class="main-column">
      <header class="topbar"><div class="breadcrumb">Workspace <span>/</span> <strong>{{ selectedProject ? selectedProject.name : page === 'overview' ? 'Overview' : page[0].toUpperCase() + page.slice(1) }}</strong></div><div class="top-actions"><span class="date-label">{{ new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date()) }}</span><div class="avatar">{{ (user?.name || 'U').split(' ').map((part) => part[0]).slice(0, 2).join('') }}</div><div class="user-block"><strong>{{ user?.name }}</strong><small>{{ user?.role || 'Member' }}</small></div><button class="button quiet" @click="signOut">Sign out</button></div></header>

      <div class="page-content">
        <div v-if="error" class="alert-error"><span>{{ error }}</span><button @click="clearError">×</button></div>
        <div v-if="notice" class="toast">✓ {{ notice }}</div>

        <template v-if="page === 'overview'">
          <div class="page-heading"><div><p class="eyebrow">YOUR WORKSPACE</p><h1>Overview</h1><p class="muted">A clear view of what’s happening across your work.</p></div><button class="button primary" @click="startProject()"><span>＋</span> New project</button></div>
          <div class="stats-grid">
            <article class="stat-card"><div class="stat-top"><span>Total projects</span><span class="stat-icon violet">▤</span></div><strong>{{ projects.length }}</strong><small><i class="dot violet-dot"></i>Across your workspace</small></article>
            <article class="stat-card"><div class="stat-top"><span>Active projects</span><span class="stat-icon green">↗</span></div><strong>{{ projects.filter(p => p.status === 'active').length }}</strong><small><i class="dot green-dot"></i>Currently in progress</small></article>
            <article class="stat-card"><div class="stat-top"><span>Teams</span><span class="stat-icon blue">♧</span></div><strong>{{ teams.length }}</strong><small><i class="dot blue-dot"></i>Collaborative groups</small></article>
            <article class="stat-card"><div class="stat-top"><span>Completed projects</span><span class="stat-icon amber">✓</span></div><strong>{{ projects.filter(p => p.status === 'completed').length }}</strong><small><i class="dot amber-dot"></i>Successfully delivered</small></article>
          </div>
          <section class="panel"><div class="panel-heading"><div><h2>Recent projects</h2><p>Pick up where your team left off.</p></div><button class="text-button" @click="page = 'projects'">View all <span>→</span></button></div>
            <ProjectRows :projects="projects.slice(0, 5)" @open="openProject" @edit="startProject" @delete="removeProject" />
          </section>
          <section class="panel teams-panel"><div class="panel-heading"><div><h2>Your teams</h2><p>Teams connected to your workspace.</p></div><button class="text-button" @click="page = 'teams'">View all <span>→</span></button></div>
            <div v-if="teams.length" class="team-grid"><article v-for="team in teams.slice(0, 3)" :key="team.id" class="team-card"><span class="team-avatar">{{ team.name.slice(0, 1).toUpperCase() }}</span><div><strong>{{ team.name }}</strong><small>{{ team.members_count ?? team.members?.length ?? 0 }} members · {{ team.projects_count ?? 0 }} projects</small></div><span class="team-arrow">↗</span></article></div>
            <p v-else class="empty-state">No teams yet.</p>
          </section>
        </template>

        <template v-else-if="page === 'projects' && !selectedProject">
          <div class="page-heading"><div><p class="eyebrow">WORK MANAGEMENT</p><h1>Projects</h1><p class="muted">Manage projects, owners, timelines, and delivery status.</p></div><button class="button primary" @click="startProject()"><span>＋</span> New project</button></div>
          <section class="panel"><div class="toolbar"><div class="search-box"><span>⌕</span><input v-model="search" placeholder="Search projects…" /></div><span class="results-count">{{ visibleProjects.length }} projects</span></div>
            <ProjectRows :projects="visibleProjects" @open="openProject" @edit="startProject" @delete="removeProject" />
          </section>
        </template>

        <template v-else-if="page === 'projects' && selectedProject">
          <button class="back-link" @click="selectedProject = null">← All projects</button>
          <div class="detail-heading"><div><p class="eyebrow">PROJECT DETAILS</p><h1>{{ selectedProject.name }}</h1><p class="muted">{{ selectedProject.description || 'No project description provided.' }}</p></div><div class="heading-actions"><StatusPill :status="selectedProject.status" /><button class="button secondary" @click="startProject(selectedProject)">Edit project</button></div></div>
          <div class="stats-grid compact"><article class="stat-card"><div class="stat-top"><span>Total tasks</span><span class="stat-icon violet">✓</span></div><strong>{{ tasks.length }}</strong><small>In this project</small></article><article class="stat-card"><div class="stat-top"><span>Open tasks</span><span class="stat-icon amber">◷</span></div><strong>{{ openTasks }}</strong><small>Still to be completed</small></article><article class="stat-card"><div class="stat-top"><span>Completed</span><span class="stat-icon green">✓</span></div><strong>{{ completedTasks }}</strong><small>Marked as done</small></article><article class="stat-card"><div class="stat-top"><span>Team</span><span class="stat-icon blue">♧</span></div><strong class="team-stat">{{ selectedProject.team?.name || '—' }}</strong><small>Assigned to project</small></article></div>
          <section class="panel"><div class="panel-heading"><div><h2>Tasks</h2><p>Track and update work for this project.</p></div></div>
            <form class="task-create" @submit.prevent="addTask"><input v-model="taskForm.title" placeholder="Add a task…" required /><select v-model="taskForm.priority"><option value="low">Low priority</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select><button class="button primary" :disabled="!taskForm.title.trim()">Add task</button></form>
            <div v-if="tasks.length" class="task-list"><article v-for="task in tasks" :key="task.id" class="task-row"><select class="task-status" :value="task.status" :aria-label="`Status for ${task.title}`" @change="changeTaskStatus(task, $event.target.value)"><option value="todo">To do</option><option value="in_progress">In progress</option><option value="review">Review</option><option value="done">Done</option></select><div class="task-copy"><strong :class="{ finished: task.status === 'done' }">{{ task.title }}</strong><small>{{ task.assignee?.name ? `Assigned to ${task.assignee.name}` : 'Unassigned' }}<template v-if="task.due_date"> · Due {{ task.due_date }}</template></small></div><span class="priority" :class="task.priority">{{ task.priority }}</span><button class="icon-button danger" title="Delete task" @click="removeTask(task)">×</button></article></div><div v-else class="empty-state spacious">No tasks yet. Add the first task above.</div>
          </section>
        </template>

        <template v-else-if="page === 'teams'"><div class="page-heading"><div><p class="eyebrow">PEOPLE & COLLABORATION</p><h1>Teams</h1><p class="muted">Teams and people working across your projects.</p></div></div><section class="team-grid full-grid"><article v-for="team in teams" :key="team.id" class="team-card large-team"><span class="team-avatar">{{ team.name.slice(0, 1).toUpperCase() }}</span><div><strong>{{ team.name }}</strong><small>{{ team.description || `${team.members_count ?? team.members?.length ?? 0} members · ${team.projects_count ?? team.projects?.length ?? 0} projects` }}</small></div><div class="member-stack"><span v-for="member in (team.members || []).slice(0, 4)" :key="member.id" :title="member.name">{{ member.name.slice(0, 1) }}</span></div></article><p v-if="!teams.length" class="empty-state">No teams available.</p></section></template>
      </div>
    </section>

    <dialog id="project-dialog" class="dialog" @click.self="$event.target.close()"><form class="dialog-card" @submit.prevent="saveProject"><div class="dialog-heading"><div><p class="eyebrow">PROJECT</p><h2>{{ editingProject ? 'Edit project' : 'Create a project' }}</h2></div><button type="button" class="icon-button" @click="$event.currentTarget.closest('dialog').close()">×</button></div><label>Project name<input v-model="projectForm.name" maxlength="255" required placeholder="e.g. Website redesign" /></label><label>Description<textarea v-model="projectForm.description" rows="3" placeholder="What is this project about?"></textarea></label><div class="form-pair"><label>Status<select v-model="projectForm.status"><option value="planning">Planning</option><option value="active">Active</option><option value="on_hold">On hold</option><option value="completed">Completed</option></select></label><label>Team<select v-model="projectForm.team_id"><option value="">No team</option><option v-for="team in teams" :key="team.id" :value="team.id">{{ team.name }}</option></select></label></div><div class="form-pair"><label>Start date<input v-model="projectForm.start_date" type="date" /></label><label>End date<input v-model="projectForm.end_date" type="date" /></label></div><p v-if="error" class="error-message">{{ error }}</p><div class="dialog-actions"><button type="button" class="button quiet" @click="$event.currentTarget.closest('dialog').close()">Cancel</button><button class="button primary">{{ editingProject ? 'Save changes' : 'Create project' }}</button></div></form></dialog>
  </div>
</template>

<script>
const ProjectRows = {
  props: { projects: { type: Array, default: () => [] } },
  emits: ['open', 'edit', 'delete'],
  components: { StatusPill: { props: ['status'], template: '<span class="status-pill" :class="status">{{ (status || "planning").replace("_", " ") }}</span>' } },
  template: `<div v-if="projects.length" class="project-table"><div class="table-head"><span>PROJECT</span><span>STATUS</span><span>OWNER</span><span>TEAM</span><span>UPDATED</span><span></span></div><article v-for="project in projects" :key="project.id" class="project-row"><button class="project-name" @click="$emit('open', project.id)"><span class="project-icon">▤</span><span><strong>{{ project.name }}</strong><small>{{ project.description || 'No description' }}</small></span></button><span><span class="status-pill" :class="project.status">{{ (project.status || 'planning').replace('_', ' ') }}</span></span><span class="owner-cell"><span class="mini-avatar">{{ (project.owner?.name || 'U').slice(0, 1) }}</span>{{ project.owner?.name || '—' }}</span><span class="team-cell">{{ project.team?.name || '—' }}</span><span class="updated-cell">{{ project.updated_at ? new Date(project.updated_at).toLocaleDateString() : '—' }}</span><span class="row-actions"><button class="icon-button" title="Edit project" @click="$emit('edit', project)">✎</button><button class="icon-button danger" title="Delete project" @click="$emit('delete', project)">×</button></span></article></div><div v-else class="empty-state spacious">No projects found. Create a project to get started.</div>`,
};
const StatusPill = { props: ['status'], template: '<span class="status-pill" :class="status">{{ (status || "planning").replace("_", " ") }}</span>' };
export default { components: { ProjectRows, StatusPill } };
</script>
