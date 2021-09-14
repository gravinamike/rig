export async function get({ params }: {params: any}) {
  const { name } = params;
  return {
    body: {
      name,
      avatar: `https://avatars.dicebear.com/api/human/${name}.svg`,
    },
  };
}