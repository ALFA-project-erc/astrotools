import SexaDegrees from "@/components/SexaDegrees.vue";
import { VueWrapper, shallowMount } from "@vue/test-utils";
import { updateAndNextFactory } from "./utils";


describe("SexaDegrees.vue", () => {
    let wrapper: VueWrapper<any>;
    let updateAndNext: () => Promise<void>;
  
    beforeEach(async () => {
      wrapper = shallowMount(SexaDegrees, {
        props: {
          value: Promise.resolve("3,01;3,14"),
        },
      });
      updateAndNext = updateAndNextFactory(wrapper.vm);
      await updateAndNext();
    });

    it("correctly parses", async ()=>{
        expect(wrapper.vm.$data.sexagesimal).toMatch("03s01° ; 03'14''")
        expect(wrapper.vm.$data.degrees).toMatch("181.05°")
        
        await wrapper.setProps({value: Promise.resolve("1,1;30,31")})
        await updateAndNext();

        expect(wrapper.vm.$data.sexagesimal).toMatch("01s01° ; 30'31''")
        expect(wrapper.vm.$data.degrees).toMatch("61.51°")
    });

    it("goes through each state on clicks", async ()=>{
        expect(wrapper.text()).toMatch("03s01° ; 03'14''");

        await wrapper.find("div").trigger("click");
        expect(wrapper.text()).toMatch("181.05°");
    
        await wrapper.find("div").trigger("click");
        expect(wrapper.text()).toMatch("03s01° ; 03'14''");
    });
});