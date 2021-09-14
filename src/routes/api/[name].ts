import type { paramSet, Person } from '../index.svelte';

export async function get({ params }: {params: paramSet}): Promise<{ body: Person }> {
  const { name } = params;
  return {
    body: {
      name,
      avatar: `https://avatars.dicebear.com/api/human/${name}.svg`,
    },
  };
}