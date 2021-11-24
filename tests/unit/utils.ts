export const updateAndNextFactory =
  (vm: { $nextTick: () => Promise<void> }) => async (): Promise<void> => {
    await Promise.resolve();
    return vm.$nextTick();
  };
