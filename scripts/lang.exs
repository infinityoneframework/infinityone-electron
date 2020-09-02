defmodule Lang do
  @moduledoc """
  Helper for creating lang.json files.

  ## Usage

  run iex from project root directory

      iex>  Code.eval_file "scripts/lang.exs"

  Follow the printed instructions.
  """


  def help do
    IO.puts ~s/
    Create entries for lang.json files.

    First run "yarn i18n:report" and the copy the output rows (exclude the header)

    Then run
        iex> rr = Lang.parse """
              <paste copied data>
              """

    Copy the output and paste it into google translate. copy the translated output.

    Run
        iex> Lang.report rr, """
        < paste trantated text>
        """

    The output is the json that can be copied and pasted into the appropriate lang file.
    /
  end

  def parse(report) do
    report
    |> String.split("\n", trim: true)
    |> parse_list()
    |> print_list()
  end

  defp print_list(list) do
    IO.puts("Copy the items between the ------ and paste them into google traslate")
    IO.puts("--------------------------------")
    Enum.each(list, &IO.puts/1)
    IO.puts("--------------------------------")
    list
  end

  defp parse_list(list) do
    list
    |> Enum.map(&String.split(&1, "│", trim: true)
    |> List.last()
    |> String.trim)
    |> Enum.uniq()
  end

  def report(keys, values) do
    IO.puts("--------------------------------")
    keys
    |> Enum.zip(String.split(values, "\n", trim: true))
    |> Enum.map(fn {k, v} -> ~s/  "#{k}": "#{v}"/ end)
    |> Enum.join(",\n")
    |> IO.puts()
    IO.puts("--------------------------------")
  end
end

Lang.help()
