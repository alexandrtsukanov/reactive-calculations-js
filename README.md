# reactive-calculations-js

## Библиотека для реактивных вычислений.

Настоящая библиотека позволяет создавать одни сущности зависимости от других. Зависимость одной сущности от другой инициализируется в момент ее создания. При изменении первой сущнонсти зависимые от нее сущности меняются автоматически.

### Старт

Установить репозиторий, команды:
```
git clone https://github.com/alexandrtsukanov/reactive-calculations-js.git
npm install
```
Запутсить тесты
```
npm run test
```

Также тесты запускаются при каждом коммите (это реализовано через библиотеку `husky`)

### Определения

Для удобства понимания дадим следующие определения:

*Реактив* - объект, реализующий API созидания и управления зависимостями, основная единица настоящей библиотеки. Является инстансом класса `Reactive` и наследуемых от него классов. Изолирован относительно типов данных, которые в себе хранит. То есть для чисел применяется отдельный реактив, для строк - отдельный, для итерабл-объектов - отдельный и так далее. Изоляция по типам в библиотеке существует по причинам: 1) чтобы не дать выполнить какую-либо арифметическую операцию между, например, числом и массивом (защита от NaN), 2) чтобы удобно расширить API реактива для разных типов js-данных в зависимсоти от их сигнатуры (подробнее об этом ниже). Значение по умолчанию - `null`.

Реактив создается группой методов, начинающихся с `create...`:

+ Для чисел - `createVal`
+ Для строк - `createStr`
+ Для булевых значений - `createBoolean`
+ Для массивов - `createArray`
+ Для объектов - `createObject`
+ Для произвольных итерабл-объектов - `createIterable`
+ Для функций - `createFunction`
+ Для промисов - `createPromise`
+ Для регулярных выражений - `createRegExp`
+ Отдельно реалозована возможность создавать зависимости от DOM-событий (посредством метода `createObject`, так как DOM-событие - это по факту объект) - через метод `createDOMEvent`

Библиотека не поддерживает тип данных `undefined`.

*Зависимость* - состояние, при котором сущность Б зависит от сущности Б, Б автоматичкски меняется при изменении А по определенному алгоритму (о котором речь пойдет ниже), А управляет заначением Б. 
Зависимость может создаваться 2-мя путями - 1) при инициализации сущности и 2) в рандомный момент. Зависимость при инициализации - это когда зависимсть создается сразу же в момент создания сущности, то есть мы создаем сущность уже как зависимую от другой. Зависимость в рандомный момент - это когда мы создаем зависимость одной сущности от другой в любой момент времени, когда мы этого хотим, то есть есть сущности А и Б, они живут себе как независимые, и мы в определенном месте говорим: Б теперь зависит от А.

Создание зависимости при инициализации происходит через вызов группы методов, начинающихся с `from...`, куда мы передаем реактив(ы), от которых новая сущность зависит (может зависеть и от нескольких реактивов). Аналогично методам `create...`, `from...` изолирован по типам данных:

+ Для чисел - `fromNum`
+ Для строк - `fromStr`
+ Для булевых значений - `fromBool`
+ Для массивов - `fromArr`
+ Для объектов - `fromObj`
+ Для произвольных итерабл-объектов - `fromIter`
+ Для функций - `fromFn`
+ Для промисов - `fromProm`
+ Для регулярных выражений - `fromRe`

Создание зависимости в рандомный момент происходит через вызов метода `dependOn` у реактива, вызывается у реактива, который зависит, аргументом передается реактив(ы), от которого зависит.

*Правило зависимости* - функция-коллбэк, которая говорит, каким образом Б зависит от А. Передается в метод реактива `depend`. Например, правило `value => value * 2` говорит о том, что при зависимости Б от А Б в любой момент времени больше А в 2 раза (пока Б зависит от А). Применение: `const b = fromNum(a).depend(value => value * 2)` или `b.dependsOn(a).depend(value => value * 2)`. В библиотеке предусмотрено, чтобы правило зависимости всегда, неважно, в каком месте цепочки находится реактив, принимало строго такое же количество аргументов, как и количество сущностей, от которых он зависит. В случае несовпадения выбрасывается исключение.

*Родитель зависимости* - сущность, от которой зависит другая сущность.

*Ребенок зависимостей* - сущность, которая зависит от другой сущности. Так, если Б зависит от А, то А будет родителем, Б - ребенком.

*Цепочка зависимостей* - состояние, когда есть n-ное количество следующих последовательно друг за другом пар родитель-ребенок какой угодно длины. Пример, как может выглядеть цепочка зависимостей: 
```
const a = createNum(2);
const b = fromNum(a).depend(val => val + 10);
const c = fromNum(b).depend(val => val - 4);
const d = fromNum(c).depend(val => val * 2);
const e = fromNum(d).depend(val => val * 10);
```

*Цепочка правил зависимости* - зависимость одной сущности от другой может регулироваться не одним вызовом метода `depend`, а несколькими его вызовами подряд, в цепочке. Такую цепочку назовем цепочкой правил зависимости. Пример, как это может выглядеть:
```
const a = createNum(10);
const b = fromNum(a)
    .depend(val => val + 5)
    .depend(val => val - 3)
    .depend(val => val * 2)
```

P.S. На практике это более применимо, например, к массивам, об этом позже.

Правила-функции цепочки правил зависимости ребенка от родителя хранятся списком внутри свойства реактива `rules`. При обновлении занчения родителя для обновления значения ребенка функции из `rules` вызываются последовательно по технологии pipe https://wavelop.com/en/story/javascript-pipe-function/. В случае цепочки правил зависимости при инициализации зависимого значения во время первого вызова `depend` в правило в качестве аргумента будет падать значение родителя, при последующих вызовах `depend` - последнее значение зависимого реактива.

*Пустая зависимость* - может быть и так, что какая-либо сущность зависит от другой, но у нее нет правила зависимости. Такую зависимсоть назовем пустой зависимостью. Это означает, что сущность по факту зависит от другой, но без правила. В этом случае если внутри цепочки зависимостей будет пустая зависимость, и за ней в цепочке зависимостей следует непустая зависимость, то правило-коллбэк этой непустой зависимости будет применяться к ближайшей родительской непустой сущности, если смотреть по в цепочке зависимсотей вверх. То есть в качестве аргументов в правило будут попадать значения ближайших непустых родителей, если смотреть по цепочке вверх. Данный функционал реализован через свойство closestNonEmptyParents, которое и хранит список ближайших верхних непустых родителей. 
Пример на практике:
```
const a = createNum(1);
const b = createNum(2);
const c = fromNum(a, b);
const d = fromNum(c);
const e = fromNum(d);
const f = fromNum(e)
const g = fromNum(f).depend((valA, b) => valA + b + 7);
```

В этом примере во время изменении `g` в качестве аргументов в правило `g` попадают значения реактивов `a` и `b` как ближайших врехних непутсых родителей.

*Нестрогая зависимость* - по умолчанию все зависмости в библиотеке строгие, это значит, что если величина зависима, то мы напрямую не можем ее изменить (исключения при попытке не будет, просто значение не поменяется). Но мы можем сделать зависимость нестрогой, это значит, что мы зависимую величину можем сами изменить напрямую как мы хотим. Но как только поменяем ее родителя, то зависимая величина поменяется в соответствии с правилом зависмости. Как реализуется: в метод `depend` вторым необязательным параметром передаем объект `options` - `{isStrict: boolean}`. У реактива есть соответсвующее свойство `isStrict`, равное по умолчанию `true`.

### API

*Общий класс реактива*:

Свойства:\
`value` - значение реактива, нельзя читать снаружи.\
`deps` - дети реактива.\
`parents` - родители реактива.\
`rules` - последовательный (важен порядок) список правил. Реализован в виде списка, чтобы выполнять функционал задания зависимости с помощью нескольких правил, а не одного.\
`closestNonEmptyParents` - список ближайших сверху в цепочке родителей с непустой зависимостью.\
`isStrict` - строгая ли зависимость.

Методы:\
`getValue` - получение значения.\
`depend(callback: Function, options?: {isStrict: boolean})` - инициализация правила зависимости.\
`dependsOn(...reactives: Reactive[])` - инициализация зависмости в рандомный момент.\
`update(newValue: ReactiveType | () => ReactiveType)` - изменение значения реактива. Можно как напрямую засетить новое значение, так и поментяь его через функцию от старого значения.\
`free(...reactives: Reactive[])` - освобождение от зависимости со стороны родителя, то есть `parent.free(child)`.\
`break(...reactives: Reactive[])` - освобождение от зависимости со стороны ребенка, то есть `child.break(parent)`.

Для данных типов чисел и строк поддерживается общий стандартный API. Далее, для других типов данных поддержано расширение общего API в целях адаптации к особенностям этих самых данных.

*Логические значения*:

Методы:\
`same()` - инициализация правила зависимости (depend), где значение такое же.\
`opposite()` - инициализация правила зависимости (depend), где значение противоположное.\
`toggle()` - изменение значения (update) на противоположное.

*Массивы*:

Расширенные методы инициализации правила зависимости:\
`map(value => newValue)` - зависимость через коллбэк, новый массив формируется через применение коллбэка к каждому элементу массива-родителя.\
`filter(value => boolean)` - ограничение наличия в зависимом массиве определенных элементов из массива-родителя.\
`flatMap(value => newValue)` - зависимость через монадический метод.\
`append(Array)` - добавление в зависимый массив n-ного количества элементов в конец.\
`unshift(Array)` - добавление в зависимый массив n-ного количества элементов в начало.\
`reverse()` - зависимый массив - перевернутая версия массива-родителя.

P.S. - поддерживается и обычный `depend`. Указанные методы инициализации правила зависимости также работают только при наличии одного единственного родителя, иначе кидается исключение. Из данных методов можно удобно и декларативно создавать цепочку правил зависимости одного массива от другого.

*Объекты*:

Расширенные методы инициализации правила зависимости:\
`map((key, value) => [newKey, newValue])` - зависимость через коллбэк. Коллбэк принимает ключ и значение, возвращает кортеж из измененного ключа и измеменного значения, данное правило применится ко всем парам ключ-значение.\
`flatMap(value => newValue)` - зависимость через монадический метод.

P.S. - поддерживается и обычный `depend`. Указанные методы инициализации правила зависимости также работают только при наличии одного единственного родителя, иначе кидается исключение.

*Итерабл-объекты*:

Идея реактивов над итерабл-объетами такая, чтобы по максимуму универсализировать функционал библиотеки для разных перебираемых типов данных (массивы, строки) и охватить ранее не охваченные структуры данных, например, сеты или псевдомассивы типа `arguments`.
У итерабл-объектов есть отдельный метод `getIterator()`, который возвращает итератор от `value`.
Расширенные методы инициализации правила зависимости у итерабл-объектов под капотом работают следующим образом: берется исходный итерабл-объект, склеивается в массив через оператор спред, от склеенного массива происходит изменение исходного объекта и возвращается его итератор.

Сами методы:\
`map(value => newValue)` - зависимость через коллбэк, новый массив формируется через применение коллбэка к каждому элементу массива-родителя.\
`filter(value => boolean)` - ограничение наличия в зависимом массиве определенных элементов из массива-родителя.\
`reverse()` - зависимый массив - перевернутая версия массива-родителя.

P.S. - поддерживается и обычный `depend`. Указанные методы инициализации правила зависимости также работают только при наличии одного единственного родителя, иначе кидается исключение.

*Функции*:

Функции поддерживают зависимость только от одного родителя, в ином случае бросается исключение.
Идея зависмостей функций друг от друга: функция Б зависит от функции А через правило П, в таком случае можно вызвать функцию А, результат передается в П, таким образом формируется новая функция у Б, и если вызвать функцию у Б, то она будет вызвана через pipe относительн последовательно А и П.

*Промисы*:

Особенность промисов в настоящей библиотеке: изменение родителя цепочки зависимостей промисов в настоящий момент поддерживается только в том случае, если длина этой цепочки не превышает 2 промиса. В ином случае бросается исключение. Причина - сложная реализация данного фукнционала в моменте и в условиях сжатых сроков. 
Но если не менять родитель, а только инициализировать цепочку, то поддерживается сколь угодно длинная цепочка зависмостей промисов. 

*Регулярки*:

Расширенные методы инициализации правила зависимости:\
`addFlags(flags: strings[])` - добавляет флаги в зависимой регулярке\
`removeFlags(flags: strings[])` - убирает флаги в зависимой регулярке

*DOM-события*:

Для DOM-событий реализована функция createDOMEvent. Она возвращает объект с 3 методами - flatMap, map и filter. Эти методs - асинхронные генераторы. Их можно попробовать вызвать и посмотреть следующим образом:

```
const mapIterator = createDOMEvent(emitter, event).map(cb);

(async () => {
    for await (const item of mapIterator) {
        console.log(item);
    }
})();
```