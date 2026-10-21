import { defineStore } from 'pinia';
import { ref } from 'vue';
import { api } from '../services/api';

export const useTeamStore = defineStore('teams', () => {
  const teams = ref([]);
  const loading = ref(false);
  const activeTeam = ref(null);

  async function fetchTeams() {
    loading.value = true;
    try {
      const response = await api.teams();
      teams.value = response.data || response || [];
      return teams.value;
    } finally {
      loading.value = false;
    }
  }

  async function fetchTeam(id) {
    const team = await api.team(id);
    activeTeam.value = team;
    return team;
  }

  async function createTeam(data) {
    const created = await api.createTeam(data);
    await fetchTeams();
    return created;
  }

  async function updateTeam(id, data) {
    const updated = await api.updateTeam(id, data);
    await fetchTeams();
    return updated;
  }

  async function deleteTeam(id) {
    await api.deleteTeam(id);
    await fetchTeams();
  }

  return {
    teams,
    loading,
    activeTeam,
    fetchTeams,
    fetchTeam,
    createTeam,
    updateTeam,
    deleteTeam,
  };
});
