---
title: LLMs
---

<script>
  import OpenLLMsButton from "$lib/components/OpenLLMs.svelte";
  import ViewSourceButton from "$lib/components/ViewSourceButton.svelte";
</script>

The Layerchart documentation pages are designed to be accessible for humans developers using LLMs as well as  large language models (LLMs) ingesting training data.

## :icon{name="lucide:user" class="relative -top-1"} For the Humans

<OpenLLMsButton example/>

At the top of each documentation page, and demonstrated above, you'll find a button which copies the content of the page's documentation in Markdown to the clipboard. The convenient dropdown gives you additional helpful options.

::note
The option for `View Component Source` is only shown for component pages.
::

## :icon{name="lucide:bot" class="relative -top-1"} For the Bots

LayerChart adopts the [llms.txt](https://llmstxt.org/) proposal standard, which provides a structured, machine-readable format optimized for LLMs. This enables developers, researchers, and AI systems to efficiently parse and utilize our documentation.

::note
Not all pages may support the `/llms.txt` suffix (ie those deemed irrelevant to LLMs).
::

## LLM-friendly Documentation 3 Ways

1. To access the LLM-friendly version of supported Layerchart documentation pages, simply append `/llms.txt` to the end of the page's URL. This will return the content in a plain-text, LLM-optimized format. This is the same text which is copied to the clipboard when you click the `View Page Markdown` button.

:::tip
- **Standard Page**: The LineChart component documentation is available at [layerchart.com/docs/components/LineChart](/docs/components/LineChart).
  
- **LLM-friendly Version**: is available at [layerchart.com/docs/components/Linechart/llms.txt](/docs/components/LineChart/llms.txt).
:::

1. To explore all supported pages in LLM-friendly format, visit the root index at [layerchart.com/llms.txt](/llms.txt). This page provides a comprehensive list of available documentation endpoints compatible with the `llms.txt` standard.

1. For a complete, consolidated view of the all the Layerchart documentation in an LLM-friendly format, navigate to [layerchart.com/docs/llms.txt](/docs/llms.txt). This single endpoint aggregates all documentation content into a machine-readable structure, ideal for bulk processing or ingestion into AI systems.
