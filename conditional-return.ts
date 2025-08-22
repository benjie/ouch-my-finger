import { type ExecutionDetails, type GrafastResultsList, type PromiseOrDirect, Step } from 'postgraphile/grafast';

/**
 * Represents a step that conditionally returns the result of two other steps based on a boolean condition.
 * Inherits from Step class.
 *
 * @property {boolean} isSyncAndSafe - Indicates if the step is synchronous and safe.
 *
 * @param {Step<boolean>} $condition - The step that provides the boolean condition.
 * @param {Step} $a - The step to return if the condition is true.
 * @param {Step} $b - The step to return if the condition is false.
 *
 * @method execute - Executes the step by evaluating the condition and returning the result of either $a or $b.
 */
class ConditionalReturnStep extends Step {
  isSyncAndSafe = true;

  constructor($condition: Step<boolean>, $a: Step, $b: Step) {
    super();
    this.addDependency($condition);
    this.addDependency($a);
    this.addDependency($b);
  }

  execute({
    indexMap,
    values: [conditionDep, aDep, bDep],
  }: ExecutionDetails<readonly any[]>): PromiseOrDirect<GrafastResultsList<any>> {
    return indexMap((i: number) => {
      const condition: boolean = conditionDep.at(i);
      const a = aDep.at(i);
      const b = bDep.at(i);

      return condition ? a : b;
    });
  }
}

/**
 * Creates a new ConditionalReturnStep instance with the provided condition and two executable steps.
 *
 * @param $condition - The executable step that returns a boolean condition.
 * @param $a - The executable step to be executed if the condition is true.
 * @param $b - The executable step to be executed if the condition is false.
 * @returns A new ConditionalReturnStep instance with the given condition and steps.
 */
export function conditionalReturn($condition: Step<boolean>, $a: Step, $b: Step): ConditionalReturnStep {
  return new ConditionalReturnStep($condition, $a, $b);
}
