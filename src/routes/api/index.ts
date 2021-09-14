export interface Person { name: string, avatar: string }

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