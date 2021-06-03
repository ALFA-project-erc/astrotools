export const updateAndNextFactory = (vm: any) => async () => {
  await Promise.resolve();
  return await vm.$nextTick();
};
