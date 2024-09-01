var Reactive = require('../reactive').Reactive;
var r = new Reactive(1);
console.log('==>', r.getValue());
// interface DependencyOptions {
//     isStrict: boolean;
// }
// class BooleanReactive extends Reactive {
//     constructor(value = null) {
//         super(value)
//     }
//     same(options?: DependencyOptions) {
//         return this.depend(value => value, options);
//     }
//     opposite(options?: DependencyOptions) {
//         return this.depend(value => !value, options);
//     }
//     toggle() {
//         this.update(prev => !prev);
//     }
// }
// function fromBoolean(value: boolean) {
//     return new BooleanReactive(value);
// }
// function from<T>(...reactives: BooleanReactive[]) {
//     const newReactive = new BooleanReactive();
//     return createDependencyChain<T>(newReactive, reactives);
// }
// function createDependencyChain<T>(dep: BooleanReactive, parents: BooleanReactive[]) {
//     let emptyReactiveMet = false;
//     let nonEmptyReactiveMet = false;
//     parents.forEach(parent => {
//         if (dep.getDeps().has(parent)) {
//             throw new Error('Cycle dependency');
//         }
//         if (parent.isEmptyDep()) emptyReactiveMet = true;
//         if (!parent.isEmptyDep()) nonEmptyReactiveMet = true;
//         if (
//             (parent.isEmptyDep() && nonEmptyReactiveMet) ||
//             (!parent.isEmptyDep() && emptyReactiveMet)
//         ) {
//             throw new Error('Item cannot depend on both empty dependent item and non empty item');
//         }
//         parent.getDeps().add(dep);
//         dep.getParents().add(parent);
//         if (parent.isEmptyDep()) {
//             dep.closestNonEmptyParents.push(...parent.closestNonEmptyParents)
//         } else {
//             dep.closestNonEmptyParents.push(parent);
//         }
//     });
//     return dep;
// }
// module.exports = {fromBoolean, from};
