import { Context, h, Schema, Service } from 'koishi'
import {} from 'koishi-plugin-w-node'
import type JiebaNs from '@willbot-koishi/jieba'
import { type Jieba } from '@willbot-koishi/jieba'

declare module 'koishi' {
    interface Context {
        jieba: JiebaService
    }
}

export type JiebaCtor = typeof JiebaNs['Jieba']
export type { Jieba, WordDef, Tag, Token, TokenizeMode } from '@willbot-koishi/jieba'

class JiebaService extends Service {
    static inject = [ 'node' ]

    constructor(context: Context, public config: JiebaService.Config) {
        super(context, 'jieba')

        this.ctx.command('jieba', 'Jieba 分词测试命令')

        this.ctx.command('jieba.cut <sentence:text>', '将句子分词')
            .action((_, sentence) => `[分词结果] ${ this.jiebaDefault
                .cut(this.transformMessage(sentence))
                .join(' + ')
            }`)

        this.ctx.command('jieba.cutall <sentence:text>', '获取句子中所有可能存在的词')
            .action((_, sentence) => `[分词结果] ${ this.jiebaDefault
                .cutAll(this.transformMessage(sentence))
                .join(' | ')
            }`)

        this.ctx.command('jieba.tag <sentence.text>', '将句子分词，带词性')
            .action((_, sentence) => `[分词结果] ${ this.jiebaDefault
                .tag(this.transformMessage(sentence))
                .map(({ word, tag }) => `${word} [${tag}]`)
                .join(' + ')
            }`)
    }

    public Jieba: JiebaCtor
    public TokenizeMode: typeof JiebaNs['TokenizeMode']

    private jiebaDefault: Jieba

    public transformMessage = (message: string): string => h.transform(
        message,
        el => el.type === 'text' ? el.toString() : ''
    )

    async start() {
        this.Jieba = (await this.ctx.node.safeImport<typeof JiebaNs>('@willbot-koishi/jieba')).Jieba
        this.jiebaDefault = new this.Jieba()
    }
}

namespace JiebaService {
    export interface Config {}

    export const Config: Schema<Config> = Schema.object({})
}


export default JiebaService
