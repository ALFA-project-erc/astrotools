import { shallowMount, VueWrapper } from "@vue/test-utils";
import JdnJulianDate from "@/components/JdnJulianDate.vue";
import { DateResponse, jdnToDate } from "@/kanon-api";
import { updateAndNextFactory } from "./utils";

vi.mock("@/kanon-api");

const mockedCall = vi.mocked(jdnToDate);

const data0: DateResponse = {
  date: "date",
  ymd: [1, 2, 3],
  frac: 0.5,
};
const data1: DateResponse = {
  date: "date1",
  ymd: [2, 1, 4],
  frac: 0.5,
};

describe("JdnJulianDate.vue", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let wrapper: VueWrapper<any>;
  let updateAndNext: () => Promise<void>;

  beforeEach(async () => {
    mockedCall
      .mockResolvedValueOnce(data0)
      .mockResolvedValueOnce(data1)
      .mockRejectedValueOnce("error");
    wrapper = shallowMount(JdnJulianDate, {
      props: {
        jdn: 1,
      },
    });
    updateAndNext = updateAndNextFactory(wrapper.vm);
    await updateAndNext();
  });

  it("fetches date data from jdn on change", async () => {
    expect(mockedCall).toBeCalledTimes(1);

    expect(wrapper.vm.date).toEqual(data0.date);
    expect(wrapper.vm.ymd).toEqual("1/02/03");

    await wrapper.setProps({ jdn: 2 });
    await updateAndNext();
    expect(wrapper.vm.date).toEqual(data1.date);
    expect(wrapper.vm.ymd).toEqual("2/01/04");

    await wrapper.setProps({ jdn: 2 });
    await updateAndNext();
    expect(mockedCall).toBeCalledTimes(2);

    await wrapper.setProps({ jdn: 3 });
    await updateAndNext();
    expect(wrapper.vm.ymd).toEqual("");
    expect(wrapper.vm.date).toEqual("");
  });

  it("goes through each state on clicks", async () => {
    expect(wrapper.text()).toEqual("1/02/03");

    await wrapper.find("div").trigger("click");
    expect(wrapper.text()).toEqual(wrapper.props("jdn").toString());

    await wrapper.find("div").trigger("click");
    expect(wrapper.text()).toEqual(wrapper.vm.date);

    await wrapper.find("div").trigger("click");
    expect(wrapper.text()).toEqual("1/02/03");
  });
});
