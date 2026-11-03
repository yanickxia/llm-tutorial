"""第 0 课的完整示范实验；没有需要学习者填写的 TODO。"""

import random


def main():
    first = random.Random(42)
    second = random.Random(42)

    sample_a = [first.randrange(10) for _ in range(5)]
    sample_b = [second.randrange(10) for _ in range(5)]
    continued = [first.randrange(10) for _ in range(5)]

    print("seed: 42")
    print("sample A:", sample_a)
    print("sample B:", sample_b)
    print("continued A:", continued)
    print("same initial samples:", sample_a == sample_b)

    # 在相同初始状态和调用序列下，局部生成器应给出相同结果。
    # 不要求继续抽样一定得到不同值：随机结果可能重复。
    if sample_a != sample_b:
        raise SystemExit("REPRO: FAIL — 相同种子的两个生成器没有产生相同的首组样本")

    print("REPRO: OK — 本次标准库随机实验通过")


if __name__ == "__main__":
    main()
