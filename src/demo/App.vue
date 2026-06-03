<template>
  <div id="app">
    <nav class="flex items-center gap-4 px-4 py-2 bg-zinc-900 text-white text-sm">
      <span class="font-semibold">Constraint Modeler Demo</span>
      <RouterLink to="/" class="hover:text-zinc-300">Home</RouterLink>
      <RouterLink to="/simple" class="hover:text-zinc-300">Simple</RouterLink>
      <RouterLink to="/debug" class="hover:text-zinc-300">Debug</RouterLink>
      <RouterLink to="/projection" class="hover:text-zinc-300">Projection</RouterLink>
      <RouterLink to="/persistent" class="hover:text-zinc-300">Persistent</RouterLink>
      <RouterLink to="/everything" class="hover:text-zinc-300">Everything</RouterLink>

      <div class="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <button class="hover:text-zinc-300"><em>User</em></button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem as-child><a href="#">Profile</a></DropdownMenuItem>
            <DropdownMenuItem as-child><a href="#">Signout</a></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>

    <div class="p-4">
      <RouterView />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
</script>

<style>
body {
  overflow-y: scroll;
}

a.router-link-exact-active {
  color: #42b983;
}
</style>
