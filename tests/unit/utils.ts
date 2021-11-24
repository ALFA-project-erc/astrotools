export const updateAndNextFactory =
  (vm: { $nextTick: () => Promise<Promise<void>> }) =>
  async (): Promise<void> => {
    await Promise.resolve();
    return await vm.$nextTick();
  };
