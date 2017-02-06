// По задумке этот модуль содержит различные аффинные пространства
// A - аффинное пространство над векторным пространством над
// R - множеством действительных чисел
// 1 - в первой степени (числовая прямая)

// автоморфизмы числовой прямой
export class AR1 {
	// коэффициенты автоморфизма x' = x * m[0] + m[1]
	public m : [number, number]

	constructor(mm: [number, number]) {
		this.m = mm
	}

	public composeWith(a2: AR1) : AR1 {
		const [a0, b0] = this.m
		const [a1, b1]  = a2.m

		return new AR1([a0 * a1, b0 * a1 + b1])
	}

	// x1 = a * x + b; x = x1 / a - b / a
	public inverse() : AR1 {
		const [a, b] = this.m
		return new AR1([1/a, -b / a])
	}

	public applyToPoint(p: number) : number {
		const [a, b] = this.m
		return a * p + b
	}

	public applyToMatrixX(sm: SVGMatrix) : SVGMatrix {
		const [a, b] = this.m
		return sm.translate(b, 0).scaleNonUniform(a, 1)
	}

	public applyToMatrixY(sm: SVGMatrix) : SVGMatrix {
		const [a, b] = this.m
		return sm.translate(0, b).scaleNonUniform(1, a)
	}
}

// У N-мерного аффинного пространства базис N+1 точек
// дополнительная точка даёт по сравнению с векторами
// дополнительную возможность описывать параллельный
// перенос (вектора - только повороты, растяжения,
// перекосы и их комбинации)
//
// Преобразование однозначно определяется парой базисов.
// На бытовом языке - два массива точек, притом первая точка
// первого массива переходит в первую точку второго.
//
// Пространство AR1 одномерное, и точек в базисе две.
//
// Например, для аффинного преобразованияз цельсия в фаренгейт нужно
// знать что в фаренгейте вода замерзает при 32 а кипит при 212
// а в цельсии соответственно 0 и 100
//
// betweenBasesAR1([32, 212], [0, 100]) нам даст преобразование
// из фаренгейта в цельсий. Не важно какая точка "меньше" -
// betweenBasesAR1([212, 32], [100, 0]) это то же самое.
//
// Можно betweenBasesAR1([212, 32], [0, 100]) писать - это будет
// перевод из фаренгейта в "обратный" цельсий, где вода
// кипит при нуле, а замерзает при +100.
// Интересно, что одно и то же преобразование получается из
// бесконечно большого количества пар базисов - это и понятно,
// перевод из цельсия в фаренгейты можно определить, зафиксировав
// температуры плавления стали и горения бумаги и т п.
//
//
//
//		 b21 - b22        b12 b21 - b11 b22
// [[a = ---------, b = - -----------------]]
//  	 b11 - b12            b11 - b12
export function betweenBasesAR1(b1 : [number, number], b2: [number, number]) : AR1 {
	const [b11, b12] = b1
	const [b21, b22] = b2
	return new AR1([(b21 - b22) / (b11 - b12), - (b12 * b21 - b11 * b22) / (b11 - b12)])
}

export class AR1Basis {
	private p1: number
	private p2: number

	constructor(pp1: number, pp2: number) {
		this.p1 = pp1
		this.p2 = pp2
	}
	public toArr() : [number, number] {
		return [this.p1, this.p2]	
	}
	
	public transformWith(transform: AR1) : AR1Basis {
		return new AR1Basis(transform.applyToPoint(this.p1), transform.applyToPoint(this.p2))
	}
}

// единичный базис
export const bUnit = new AR1Basis(0, 1)

// часто нужен хоть какой-то базис
export const bPlaceholder = bUnit


// between typed bases
export function betweenTBasesAR1(b1 : AR1Basis, b2: AR1Basis) : AR1 {
	return betweenBasesAR1(b1.toArr(), b2.toArr())
}

