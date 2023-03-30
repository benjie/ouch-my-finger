import { makeWrapPlansPlugin } from "graphile-utils";
import { lambda, access } from "grafast";
export const ThisPlugin = makeWrapPlansPlugin(
  (build) => {
    return {
      Mutation: {
        createWwdc(_, _2, args) {
          const $wwdc = args.get(["input", "wwdc"]);
          const $yearNum = access($wwdc, ["yearNum"])
          const $year_num = access($wwdc, ["year_num"])
          const $me = lambda([$wwdc, $yearNum, $year_num], ([wwdc, yearNum, year_num]) => {
            console.log(wwdc)
            console.log(yearNum)
            console.log(year_num)
          })
          $me.hasSideEffects = true;
          return _();
        }
      }
    }
  });
