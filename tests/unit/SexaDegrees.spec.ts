import SexaDegrees from "@/components/SexaDegrees.vue";
import { VueWrapper, shallowMount } from "@vue/test-utils";
import { updateAndNextFactory } from "./utils";

describe("SexaDegrees.vue", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wrapper: VueWrapper<any>;
  let updateAndNext: () => Promise<void>;

  beforeEach(async () => {
    wrapper = shallowMount(SexaDegrees, {
      props: {
        value: Promise.resolve("3,01;3,14"),
        showSexaProp: true,
      },
    });
    updateAndNext = updateAndNextFactory(wrapper.vm);
    await updateAndNext();
  });

  it("correctly parses", async () => {
    expect(wrapper.vm.sexagesimal).toEqual("03s01° ; 03'14''");
    expect(wrapper.vm.degrees).toEqual("181.05°");

    await wrapper.setProps({ value: Promise.resolve("1,1;30,31") });
    await updateAndNext();

    expect(wrapper.vm.sexagesimal).toEqual("01s01° ; 30'31''");
    expect(wrapper.vm.degrees).toEqual("61.51°");

    await wrapper.setProps({ value: Promise.resolve("-27 ; 43,07") });
    await updateAndNext();

    expect(wrapper.vm.sexagesimal).toEqual("-27° ; 43'07''");
    expect(wrapper.vm.degrees).toEqual("-27.72°");
  });

  it("goes through each state on clicks", async () => {
    expect(wrapper.text()).toEqual("03s01° ; 03'14''");

    await wrapper.find("div").trigger("click");
    expect(wrapper.text()).toEqual("181.05°");

    await wrapper.find("div").trigger("click");
    expect(wrapper.text()).toEqual("03s01° ; 03'14''");
  });
});
