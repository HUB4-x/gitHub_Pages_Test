<svelte:head>
    <title>Tools</title>
</svelte:head>


<script lang="ts">
    import { encode_base64, decode_base64 } from "../../lib/utils/tool_functions";

    let inputText: string = $state('')
    let outputText: string = $state('')
    let rounds: number = $state(1)
    let encode_decode: string = $state('encode')

    const lg_2_xs_threshold: number = 256

    function switch_input_output(){
        const old_inputText: string = inputText
        inputText = outputText
        outputText = old_inputText
    }

    function run_function(input: string, rounds: number):string {
        let tmp_res: string = input
        for(let i = 0; i < rounds; i++){
            if(encode_decode === 'encode'){
                tmp_res = encode_base64(tmp_res)
            } else if (encode_decode === 'decode'){
                tmp_res = decode_base64(tmp_res)
            } else {
                return 'ERR: wrong encode/decode value!'
            }
        }
        return tmp_res
    }

    function run(){
        outputText = run_function(inputText, rounds)
    }

</script>


<div class="size-full flex flex-col border-2 rounded-lg p-7">
    <h1 class="text-lg font-bold">Base 64</h1>
    <div class="divider"></div>
    <div class="flex w-full gap-x-5">
        <label for="encode" class="flex gap-x-1">
            <p>Encode</p>
            <input type="radio" class="my-auto radio radio-accent" name="encode" id="encode" value="encode" bind:group={encode_decode}>
        </label>
        <label for="decode" class="flex gap-x-1">
            <p>Decode</p>
            <input type="radio" class="my-auto radio radio-accent" name="encode" id="encode" value="decode" bind:group={encode_decode}>
        </label>
    </div>
    <div class="flex py-2">
        <label for="round_input" class="flex gap-x-5">
            <p class="text-lg my-auto">Number of Rounds:</p>
            <input type="number" bind:value={rounds} name="round_input" id="round_input" class="input validator min-w-1/10 w-fit" required placeholder="Number of Rounds of encoding" min="0" title="Must be >= 0"/>
            <p class="validator-hint">Must be between be 0 and infinity</p>
        </label>
    </div>
    <div class="">
        <div class="mt-5">
            <div class="divider my-1"></div>
            <div class="divider my-1">INPUT</div>
            <div class="divider my-1"></div>
            <div class="flex py-2">
                <textarea placeholder="Input" class="textarea w-full {inputText.length >= lg_2_xs_threshold? 'textarea-xs':'textarea-lg'}" bind:value={inputText}></textarea>
            </div>
        </div>

        <div class="flex ">
            <button class="btn btn-success w-1/2" onclick={run}>{encode_decode.toUpperCase()}</button>
            <button class="btn btn-info w-1/2" onclick={switch_input_output}>Switch Input/Output</button>
        </div>

        <div class="flex flex-col size-full">
            <div class="mt-15">
                <div class="divider my-1"></div>
                <div class="divider my-1">OUTPUT</div>
                <div class="divider my-1"></div>
                <div class="flex py-2">
                    <textarea placeholder="Output" class="textarea w-full {inputText.length >= lg_2_xs_threshold? 'textarea-xs':'textarea-lg'}" bind:value={outputText}></textarea>
                </div>
            </div>
        </div>
    </div>
    
</div>