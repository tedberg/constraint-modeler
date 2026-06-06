<template>
  <div id="app">
    <nav class="cm:flex cm:items-center cm:gap-4 cm:px-4 cm:py-2 cm:bg-primary cm:text-primary-foreground cm:text-sm">
      <span class="cm:font-semibold">Constraint Modeler Demo</span>
      <RouterLink to="/" class="cm:hover:opacity-70">Home</RouterLink>
      <RouterLink to="/simple" class="cm:hover:opacity-70">Simple</RouterLink>
      <RouterLink to="/debug" class="cm:hover:opacity-70">Debug</RouterLink>
      <RouterLink to="/projection" class="cm:hover:opacity-70">Projection</RouterLink>
      <RouterLink to="/persistent" class="cm:hover:opacity-70">Persistent</RouterLink>
      <RouterLink to="/everything" class="cm:hover:opacity-70">Everything</RouterLink>

      <div class="cm:ml-auto cm:flex cm:items-center cm:gap-2">
        <!-- Dark / light mode toggle -->
        <button
          class="cm:hover:opacity-70 cm:p-1"
          :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          @click="toggleMode"
        >
          <Sun v-if="!isDark" :size="16" />
          <Moon v-else :size="16" />
        </button>

        <!-- Theme picker -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button class="cm:hover:opacity-70 cm:p-1" title="Choose theme">
              <Palette :size="16" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              v-for="theme in themes"
              :key="theme.id"
              class="cm:flex cm:items-center cm:gap-2"
              @select="setTheme(theme.id)"
            >
              <Check v-if="themeId === theme.id" :size="12" />
              <span v-else class="cm:inline-block cm:w-3" />
              {{ theme.name }}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <!-- User menu -->
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button class="cm:hover:opacity-70"><em>User</em></button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem as-child><a href="#">Profile</a></DropdownMenuItem>
            <DropdownMenuItem as-child><a href="#">Signout</a></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>

    <div data-test="page-background" class="cm:p-4 cm:min-h-screen cm:bg-background cm:text-foreground">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Check, Moon, Palette, Sun } from "@lucide/vue";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "./composables/useTheme";

const { themes, themeId, isDark, setTheme, toggleMode } = useTheme();
</script>

<style>
body {
  overflow-y: scroll;
}

a.router-link-exact-active {
  opacity: 0.6;
  font-weight: 600;
}
</style>
