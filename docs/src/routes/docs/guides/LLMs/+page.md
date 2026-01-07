<script>
  import OpenLLMsButton from "$lib/components/OpenLLMs.svelte";
  import ViewSourceButton from "$lib/components/ViewSourceButton.svelte";
  import LucideBot from '~icons/lucide/bot';
  import LucideUser from '~icons/lucide/user';
</script>

# LLMs Documentation

The Layerchart documentation pages are designed to be accessible for humans developers using LLMs and large language models (LLMs) for effective content ingestion and training.

## For the Humans <LucideUser class="inline-block relative -top-0.5 left-0.5 w-7 h-7" />

<OpenLLMsButton example />

At the top of each documentation page, and demonstrated above, you'll find a button which copies the content of the page's documentation in Markdown to the clipboard. The convenient dropdown gives you addtional helpful options.

## For the Bots <LucideBot class="inline-block relative -top-0.5 left-0.5" />

LayerChart adopts the [llms.txt](https://llmstxt.org/) proposal standard, which provides a structured, machine-readable format optimized for LLMs. This enables developers, researchers, and AI systems to efficiently parse and utilize our documentation.

::note
Not all pages may support the `/llms.txt` suffix (those deemed irrelevant to LLMs).
::

## Accessing LLM-friendly Documentation

1. To access the LLM-friendly version of any supported Layerchart documentation page, simply append `/llms.txt` to the end of the page's URL. This will return the content in a plain-text, LLM-optimized format.

    - **Standard Page**: The LineChart component documentation is available at [layerchart.com/docs/components/LineChart](/docs/components/LineChart).
    - **LLM-friendly Version**: Append `/llms.txt` to access it at [layerchart.com/docs/components/Linechart/llms.txt](/docs/components/LineChart/llms.txt).

2. To explore all supported pages in LLM-friendly format, visit the root index at [layerchart.com/llms.txt](llms.txt). This page provides a comprehensive list of available documentation endpoints compatible with the `llms.txt` standard.

3. For a complete, consolidated view of the Layerchart documentation in an LLM-friendly format, navigate to [layerchart.com/docs/llms.txt](/docs/llms.txt). This single endpoint aggregates all documentation content into a machine-readable structure, ideal for bulk processing or ingestion into AI systems.
