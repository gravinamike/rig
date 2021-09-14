import type { Person } from '../index.svelte';

const names = ['Abby', 'Bernie', 'Carmen', 'Dimitri', 'Eloise',];

const generatePeople = () =>
  names.map((name) => {
    return {
      name,
      avatar: `https://avatars.dicebear.com/api/human/${name}.svg`,
    };
  });

export async function get(): Promise<{ body: Person[] }> {
  return {
    body: generatePeople(),
  };
}